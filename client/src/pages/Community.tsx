import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, Heart, Search } from 'lucide-react';

/**
 * Community Features Page
 * Buddy matching, support groups, and forums
 */

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('buddies');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock buddy data
  const buddyMatches = [
    {
      id: 1,
      name: 'Sarah',
      pregnancyWeek: 24,
      interests: ['yoga', 'nutrition', 'meditation'],
      bio: 'First time mom, love outdoor activities',
      matchScore: 92,
    },
    {
      id: 2,
      name: 'Jessica',
      pregnancyWeek: 26,
      interests: ['yoga', 'reading', 'cooking'],
      bio: 'Second pregnancy, very supportive',
      matchScore: 87,
    },
    {
      id: 3,
      name: 'Emma',
      pregnancyWeek: 22,
      interests: ['fitness', 'meditation', 'art'],
      bio: 'Due in August, excited to connect',
      matchScore: 78,
    },
  ];

  // Mock support groups
  const supportGroups = [
    {
      id: 1,
      name: 'First Time Moms',
      topic: 'first_pregnancy',
      members: 342,
      description: 'Support for first-time mothers',
      posts: 1203,
    },
    {
      id: 2,
      name: 'PPD Support Circle',
      topic: 'ppd',
      members: 189,
      description: 'Safe space for PPD discussions',
      posts: 567,
    },
    {
      id: 3,
      name: 'Anxiety & Pregnancy',
      topic: 'anxiety',
      members: 256,
      description: 'Managing anxiety during pregnancy',
      posts: 892,
    },
  ];

  // Mock forum posts
  const forumPosts = [
    {
      id: 1,
      title: 'Tips for managing pregnancy fatigue',
      author: 'Anonymous',
      replies: 23,
      views: 156,
      group: 'First Time Moms',
    },
    {
      id: 2,
      title: 'My PPD journey - 3 months postpartum',
      author: 'Sarah M.',
      replies: 45,
      views: 312,
      group: 'PPD Support Circle',
    },
    {
      id: 3,
      title: 'Breathing exercises for anxiety',
      author: 'Dr. Lisa',
      replies: 18,
      views: 203,
      group: 'Anxiety & Pregnancy',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pregnancy Community</h1>
          <p className="text-gray-600 mt-2">Connect with other pregnant women and get support</p>
        </div>
        <Users className="w-12 h-12 text-blue-500" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buddies">Buddy Matching</TabsTrigger>
          <TabsTrigger value="groups">Support Groups</TabsTrigger>
          <TabsTrigger value="forums">Forums</TabsTrigger>
        </TabsList>

        {/* BUDDY MATCHING TAB */}
        <TabsContent value="buddies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Pregnancy Buddy</CardTitle>
              <CardDescription>Connect with other pregnant women with similar interests and due dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Setup Buddy Profile */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-3">Create Your Buddy Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pregnancy Week</label>
                    <Input type="number" min="0" max="40" className="mt-1" placeholder="24" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Interests (comma separated)</label>
                    <Input className="mt-1" placeholder="yoga, nutrition, meditation" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea className="w-full mt-1 p-2 border rounded-md" rows={2} placeholder="Tell others about yourself" />
                  </div>
                </div>
                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">Create Profile</Button>
              </div>

              {/* Buddy Matches */}
              <div>
                <h3 className="font-semibold mb-3">Your Matches</h3>
                <div className="space-y-3">
                  {buddyMatches.map((buddy) => (
                    <Card key={buddy.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{buddy.name}</h4>
                            <p className="text-sm text-gray-600">{buddy.pregnancyWeek} weeks pregnant</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{buddy.matchScore}%</div>
                            <p className="text-xs text-gray-600">Match</p>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{buddy.bio}</p>
                        <div className="flex gap-2 mb-3">
                          {buddy.interests.map((interest) => (
                            <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {interest}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">Connect</Button>
                          <Button variant="outline" className="flex-1">Message</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPORT GROUPS TAB */}
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Groups</CardTitle>
              <CardDescription>Join groups to discuss pregnancy topics and get support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Groups List */}
              <div className="space-y-3">
                {supportGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{group.name}</h4>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 mb-3">
                        <span>👥 {group.members} members</span>
                        <span>💬 {group.posts} posts</span>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Join Group</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Create Group */}
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Create Your Own Group</h4>
                  <div className="space-y-3">
                    <Input placeholder="Group name" />
                    <textarea className="w-full p-2 border rounded-md" rows={2} placeholder="Group description" />
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option>Topic: General</option>
                      <option>Topic: PPD</option>
                      <option>Topic: Anxiety</option>
                      <option>Topic: First Pregnancy</option>
                    </select>
                    <Button className="w-full bg-green-600 hover:bg-green-700">Create Group</Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORUMS TAB */}
        <TabsContent value="forums" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Forums</CardTitle>
              <CardDescription>Discussions and advice from the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Post */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold mb-3">Start a Discussion</h3>
                <Input placeholder="Post title" className="mb-2" />
                <textarea className="w-full p-2 border rounded-md mb-2" rows={3} placeholder="What's on your mind?" />
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 border rounded-md">
                    <option>Select group...</option>
                    {supportGroups.map((group) => (
                      <option key={group.id}>{group.name}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" />
                    <span className="text-sm">Anonymous</span>
                  </label>
                </div>
                <Button className="mt-3 w-full bg-purple-600 hover:bg-purple-700">Post</Button>
              </div>

              {/* Posts List */}
              <div className="space-y-3">
                {forumPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="mb-2">
                        <h4 className="font-semibold hover:text-blue-600 cursor-pointer">{post.title}</h4>
                        <p className="text-sm text-gray-600">
                          Posted by <strong>{post.author}</strong> in <strong>{post.group}</strong>
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>💬 {post.replies} replies</span>
                        <span>👁️ {post.views} views</span>
                      </div>
                      <Button variant="outline" className="mt-3 w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        View Discussion
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
