import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

/**
 * Community Features Router
 * Buddy matching, support groups, forums, and provider integration
 */

export const communityRouter = router({
  // ============================================================================
  // BUDDY MATCHING SYSTEM
  // ============================================================================

  /**
   * Create buddy profile
   */
  createBuddyProfile: protectedProcedure
    .input(
      z.object({
        pregnancyWeek: z.number().min(0).max(40),
        dueDate: z.string().datetime(),
        interests: z.array(z.string()),
        languages: z.array(z.string()),
        location: z.string().optional(),
        preferredAge: z.enum(['18-25', '26-35', '36-45', '45+']).optional(),
        bio: z.string().max(500).optional(),
        isFirstPregnancy: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('buddy_profiles').insert([
          {
            user_id: ctx.user.id,
            pregnancy_week: input.pregnancyWeek,
            due_date: input.dueDate,
            interests: input.interests,
            languages: input.languages,
            location: input.location,
            preferred_age: input.preferredAge,
            bio: input.bio,
            is_first_pregnancy: input.isFirstPregnancy,
            status: 'active',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Buddy profile created! Start finding matches.',
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to create buddy profile: ${error.message}`);
      }
    }),

  /**
   * Find buddy matches (matching algorithm)
   */
  findBuddyMatches: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        // Get current user's buddy profile
        const { data: userProfile, error: profileError } = await supabase
          .from('buddy_profiles')
          .select('*')
          .eq('user_id', ctx.user.id)
          .single();

        if (profileError) throw profileError;
        if (!userProfile) return [];

        // Find potential matches
        const { data: matches, error: matchError } = await supabase
          .from('buddy_profiles')
          .select('*, users(id, full_name, avatar_url)')
          .neq('user_id', ctx.user.id)
          .eq('status', 'active')
          .limit(input.limit);

        if (matchError) throw matchError;

        // Score and rank matches
        const scoredMatches = (matches || []).map((match: any) => {
          let score = 0;

          // Week proximity
          const weekDiff = Math.abs(match.pregnancy_week - userProfile.pregnancy_week);
          score += Math.max(0, 100 - weekDiff * 10);

          // Shared interests
          const sharedInterests = (userProfile.interests || []).filter((i: string) =>
            (match.interests || []).includes(i)
          ).length;
          score += sharedInterests * 20;

          // Shared languages
          const sharedLanguages = (userProfile.languages || []).filter((l: string) =>
            (match.languages || []).includes(l)
          ).length;
          score += sharedLanguages * 15;

          // First pregnancy match
          if (userProfile.is_first_pregnancy === match.is_first_pregnancy) {
            score += 30;
          }

          return { ...match, matchScore: score };
        });

        return scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
      } catch (error: any) {
        throw new Error(`Failed to find matches: ${error.message}`);
      }
    }),

  /**
   * Send buddy request
   */
  sendBuddyRequest: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().uuid(),
        message: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('buddy_requests').insert([
          {
            from_user_id: ctx.user.id,
            to_user_id: input.targetUserId,
            message: input.message,
            status: 'pending',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Buddy request sent!',
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to send buddy request: ${error.message}`);
      }
    }),

  /**
   * Accept buddy request
   */
  acceptBuddyRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: request, error: requestError } = await supabase
          .from('buddy_requests')
          .select('*')
          .eq('id', input.requestId)
          .single();

        if (requestError) throw requestError;

        const { data: connection, error: connectionError } = await supabase
          .from('buddy_connections')
          .insert([
            {
              user_id_1: request.from_user_id,
              user_id_2: request.to_user_id,
              status: 'connected',
            },
          ]);

        if (connectionError) throw connectionError;

        await supabase
          .from('buddy_requests')
          .update({ status: 'accepted' })
          .eq('id', input.requestId);

        return {
          success: true,
          message: 'Buddy connection established!',
          data: connection?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to accept buddy request: ${error.message}`);
      }
    }),

  /**
   * Get buddy connections
   */
  getBuddyConnections: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabase
        .from('buddy_connections')
        .select('*, user_id_1(id, full_name, avatar_url), user_id_2(id, full_name, avatar_url)')
        .or(`user_id_1.eq.${ctx.user.id},user_id_2.eq.${ctx.user.id}`)
        .eq('status', 'connected');

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to get buddy connections: ${error.message}`);
    }
  }),

  // ============================================================================
  // SUPPORT GROUP FORUMS
  // ============================================================================

  /**
   * Create support group
   */
  createSupportGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(500),
        topic: z.enum(['general', 'ppd', 'anxiety', 'first_pregnancy', 'high_risk', 'loss']),
        isPrivate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: groupData, error } = await supabase
          .from('support_groups')
          .insert([
            {
              name: input.name,
              description: input.description,
              topic: input.topic,
              is_private: input.isPrivate,
              creator_id: ctx.user.id,
              member_count: 1,
            },
          ])
          .select();

        if (error) throw error;

        if (groupData && groupData.length > 0) {
          await supabase.from('group_members').insert([
            {
              group_id: groupData[0].id,
              user_id: ctx.user.id,
              role: 'admin',
            },
          ]);
        }

        return {
          success: true,
          message: 'Support group created!',
          data: groupData?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to create support group: ${error.message}`);
      }
    }),

  /**
   * Get support groups
   */
  getSupportGroups: protectedProcedure
    .input(
      z.object({
        topic: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let query = supabase.from('support_groups').select('*, group_members(count)');

        if (input.topic) {
          query = query.eq('topic', input.topic);
        }

        const { data, error } = await query.eq('is_private', false).limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get support groups: ${error.message}`);
      }
    }),

  /**
   * Join support group
   */
  joinSupportGroup: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('group_members').insert([
          {
            group_id: input.groupId,
            user_id: ctx.user.id,
            role: 'member',
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Joined support group!',
        };
      } catch (error: any) {
        throw new Error(`Failed to join group: ${error.message}`);
      }
    }),

  /**
   * Post to support group
   */
  postToGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.number(),
        title: z.string().min(3).max(200),
        content: z.string().min(10).max(5000),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('group_posts').insert([
          {
            group_id: input.groupId,
            user_id: input.isAnonymous ? null : ctx.user.id,
            title: input.title,
            content: input.content,
            is_anonymous: input.isAnonymous,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Post created!',
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to post to group: ${error.message}`);
      }
    }),

  /**
   * Get group posts
   */
  getGroupPosts: protectedProcedure
    .input(
      z.object({
        groupId: z.number(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase
          .from('group_posts')
          .select('*, users(id, full_name, avatar_url), group_post_replies(count)')
          .eq('group_id', input.groupId)
          .order('created_at', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        return data || [];
      } catch (error: any) {
        throw new Error(`Failed to get group posts: ${error.message}`);
      }
    }),

  /**
   * Reply to group post
   */
  replyToPost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1).max(2000),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabase.from('group_post_replies').insert([
          {
            post_id: input.postId,
            user_id: input.isAnonymous ? null : ctx.user.id,
            content: input.content,
            is_anonymous: input.isAnonymous,
          },
        ]);

        if (error) throw error;

        return {
          success: true,
          message: 'Reply posted!',
          data: data?.[0],
        };
      } catch (error: any) {
        throw new Error(`Failed to post reply: ${error.message}`);
      }
    }),
});
