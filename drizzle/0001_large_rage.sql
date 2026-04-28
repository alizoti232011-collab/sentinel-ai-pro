CREATE TABLE `admin_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricsDate` timestamp NOT NULL,
	`totalUsers` int NOT NULL DEFAULT 0,
	`activeUsers` int NOT NULL DEFAULT 0,
	`dailyActiveUsers` int NOT NULL DEFAULT 0,
	`totalInterventions` int NOT NULL DEFAULT 0,
	`interventionAcceptanceRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`retentionDay1` decimal(5,2) NOT NULL DEFAULT '0.00',
	`retentionDay7` decimal(5,2) NOT NULL DEFAULT '0.00',
	`retentionDay30` decimal(5,2) NOT NULL DEFAULT '0.00',
	`avgMoodScore` decimal(5,2) NOT NULL DEFAULT '0.00',
	`avgWellnessScore` decimal(5,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `behavioral_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sleepHours` decimal(4,2) NOT NULL,
	`screenTimeHours` decimal(4,2) NOT NULL,
	`moodScore` int NOT NULL,
	`energyLevel` int NOT NULL,
	`activityKm` decimal(5,2) NOT NULL,
	`cancelledPlans` int NOT NULL DEFAULT 0,
	`logDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `behavioral_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interventionId` int NOT NULL,
	`status` enum('active','closed','archived') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intervention_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalInterventions` int NOT NULL DEFAULT 0,
	`acceptedInterventions` int NOT NULL DEFAULT 0,
	`dismissedInterventions` int NOT NULL DEFAULT 0,
	`acceptanceRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`lastInterventionAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intervention_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interventions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`detectedPatterns` json NOT NULL,
	`riskScore` decimal(5,2) NOT NULL,
	`userResponse` enum('accepted','dismissed','ignored') DEFAULT 'ignored',
	`respondedAt` timestamp,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patternType` enum('doom_scrolling','sleep_deprivation','social_withdrawal','mood_decline','inactivity','combined_distress') NOT NULL,
	`severity` enum('low','medium','high') NOT NULL,
	`riskScore` decimal(5,2) NOT NULL,
	`description` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `currentStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `longestStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastLogDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `wellnessScore` decimal(5,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notificationsEnabled` boolean DEFAULT true NOT NULL;