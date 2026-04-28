CREATE TABLE `behavioral_debt` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skippedExerciseDays` int NOT NULL DEFAULT 0,
	`cancelledPlansCount` int NOT NULL DEFAULT 0,
	`isolationDays` int NOT NULL DEFAULT 0,
	`exerciseDaysCompleted` int NOT NULL DEFAULT 0,
	`plansHonored` int NOT NULL DEFAULT 0,
	`socialEngagements` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavioral_debt_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buddy_matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId1` int NOT NULL,
	`userId2` int NOT NULL,
	`matchedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','paused','ended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buddy_matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intervention_effectiveness` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interventionId` int NOT NULL,
	`moodBefore` int,
	`moodAfter` int,
	`userReachedOut` boolean DEFAULT false,
	`userExercised` boolean DEFAULT false,
	`userJournaled` boolean DEFAULT false,
	`effectiveness` int,
	`feedback` text,
	`measuredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intervention_effectiveness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`emotionTags` json,
	`moodScore` int,
	`sentiment` enum('very_negative','negative','neutral','positive','very_positive'),
	`keyThemes` json,
	`aiReflection` text,
	`isPrivate` boolean NOT NULL DEFAULT true,
	`isShareableWithTherapist` boolean NOT NULL DEFAULT false,
	`entryDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_anchors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`audioUrl` text NOT NULL,
	`transcription` text,
	`recordedWhen` varchar(255),
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_anchors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pattern_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`avgMood` decimal(5,2),
	`avgSleep` decimal(5,2),
	`avgScreenTime` decimal(5,2),
	`avgActivity` decimal(5,2),
	`activePatterns` json,
	`wellnessScore` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pattern_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reverse_interventions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`suggestion` text NOT NULL,
	`helpType` varchar(255),
	`userResponse` enum('accepted','dismissed','ignored') DEFAULT 'ignored',
	`respondedAt` timestamp,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reverse_interventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `silence_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reason` varchar(255),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`stillMonitoring` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `silence_periods_id` PRIMARY KEY(`id`)
);
