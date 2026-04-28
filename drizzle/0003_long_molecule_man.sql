CREATE TABLE `accessibility_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`voiceOnlyMode` boolean NOT NULL DEFAULT false,
	`textToSpeechEnabled` boolean NOT NULL DEFAULT false,
	`dyslexiaFriendlyFont` boolean NOT NULL DEFAULT false,
	`adhdFriendlyUI` boolean NOT NULL DEFAULT false,
	`highContrast` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accessibility_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_therapist_clone` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`therapistName` varchar(255),
	`recordedSessions` int NOT NULL DEFAULT 0,
	`therapistStyle` text,
	`cloneAvailable` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_therapist_clone_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ancestral_trauma_healing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`familyMemberName` varchar(255),
	`relationship` varchar(255),
	`traumaType` varchar(255),
	`identifiedPatterns` json,
	`healingPractices` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ancestral_trauma_healing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `breastfeeding_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`feedingMethod` enum('breastfeeding','pumping','formula','mixed') NOT NULL,
	`durationMinutes` int,
	`moodBefore` int,
	`moodAfter` int,
	`challenges` json,
	`feedingDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breastfeeding_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chronotype_optimization` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chronotype` enum('morning_person','night_owl','intermediate'),
	`optimalWakeTime` varchar(255),
	`optimalBedTime` varchar(255),
	`optimalWorkTime` varchar(255),
	`productivityScore` int,
	`moodScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chronotype_optimization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `circadian_biohacking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sunlightExposureTime` varchar(255),
	`sunlightDuration` int,
	`melatoninTime` varchar(255),
	`melatoninDosage` varchar(255),
	`sleepQuality` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `circadian_biohacking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cultural_competency` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`culturalBackground` varchar(255),
	`primaryLanguage` varchar(255),
	`culturalValues` json,
	`culturalPreferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cultural_competency_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_ownership` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataOwnershipEnabled` boolean NOT NULL DEFAULT true,
	`canSellAnonymizedData` boolean NOT NULL DEFAULT false,
	`totalEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_ownership_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `environmental_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`airQualityIndex` int,
	`lightQuality` int,
	`noiseLevel` int,
	`temperature` decimal(5,2),
	`moodScore` int,
	`anxietyLevel` int,
	`dataDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `environmental_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facial_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoUrl` text NOT NULL,
	`duration` int,
	`detectedExpressions` json,
	`microExpressions` json,
	`distressIndicators` json,
	`overallMood` varchar(255),
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `facial_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_education` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`familyMemberName` varchar(255),
	`relationship` varchar(255),
	`educationCompleted` boolean NOT NULL DEFAULT false,
	`educationModules` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_education_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertility_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tryingToConceiveMonths` int,
	`cycleLength` int,
	`infertilityGrief` int,
	`counselorConnected` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fertility_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_stress_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`financialStress` int,
	`resourcesAccessed` json,
	`metricDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financial_stress_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genetic_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dnaProvider` varchar(255),
	`uploadDate` timestamp NOT NULL,
	`mentalHealthRisks` json,
	`bipolarRisk` decimal(5,2),
	`depressionRisk` decimal(5,2),
	`counselorConnected` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genetic_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gut_brain_axis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`foodItem` varchar(255) NOT NULL,
	`mealType` varchar(255),
	`moodBefore` int,
	`moodAfter` int,
	`anxietyLevel` int,
	`mealDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gut_brain_axis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `high_risk_conditions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conditionName` varchar(255) NOT NULL,
	`diagnosedDate` timestamp NOT NULL,
	`severity` enum('mild','moderate','severe') NOT NULL DEFAULT 'mild',
	`managementPlan` text,
	`monitoringFrequency` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `high_risk_conditions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hormone_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testosterone` decimal(8,2),
	`cortisol` decimal(8,2),
	`estrogen` decimal(8,2),
	`progesterone` decimal(8,2),
	`moodScore` int,
	`testDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hormone_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inflammation_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crpLevel` decimal(8,2),
	`inflammatoryMarkers` json,
	`moodScore` int,
	`depressionRisk` int,
	`antiInflammatoryPlan` text,
	`testDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inflammation_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lactation_consultant` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consultantName` varchar(255),
	`consultantEmail` varchar(255),
	`feedingDataSharing` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lactation_consultant_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `longevity_prediction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`predictedLifespan` int,
	`mentalHealthContribution` int,
	`overallHealthScore` int,
	`predictionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `longevity_prediction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maternal_identity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`identitySatisfaction` int,
	`identityIntegration` int,
	`reflection` text,
	`metricDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maternal_identity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_brain_training` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionDuration` int,
	`sessionType` varchar(255),
	`thetaWaves` decimal(5,2),
	`alphaWaves` decimal(5,2),
	`meditationQuality` int,
	`streakDays` int NOT NULL DEFAULT 0,
	`sessionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meditation_brain_training_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menstrual_cycle_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cycleDay` int,
	`phase` enum('menstruation','follicular','ovulation','luteal'),
	`moodScore` int,
	`anxietyLevel` int,
	`symptoms` json,
	`trackingDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menstrual_cycle_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_matching` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menteeId` int NOT NULL,
	`mentorId` int NOT NULL,
	`matchedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','paused','ended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_matching_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `microbiome_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testProvider` varchar(255),
	`testDate` timestamp NOT NULL,
	`depressionMarkers` decimal(5,2),
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `microbiome_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `midwife_integration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`midwifeName` varchar(255),
	`midwifeEmail` varchar(255),
	`careCoordination` boolean NOT NULL DEFAULT false,
	`lastCoordinatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `midwife_integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `miscarriage_trauma` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`miscarriageDate` timestamp NOT NULL,
	`weekOfPregnancy` int,
	`traumaLevel` int,
	`supportReceived` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `miscarriage_trauma_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `neurotransmitter_prediction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dopamineLevel` int,
	`serotoninLevel` int,
	`gabaLevel` int,
	`boostingActivities` json,
	`predictionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `neurotransmitter_prediction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ob_gyn_collaboration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`doctorName` varchar(255),
	`doctorEmail` varchar(255),
	`dataSharing` boolean NOT NULL DEFAULT false,
	`lastSharedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ob_gyn_collaboration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_support` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`partnerName` varchar(255),
	`partnerEmail` varchar(255),
	`educationCompleted` boolean NOT NULL DEFAULT false,
	`educationModules` json,
	`engagementLevel` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_support_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perinatal_psychiatrist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`psychiatristName` varchar(255),
	`psychiatristEmail` varchar(255),
	`telemedicineAvailable` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `perinatal_psychiatrist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postpartum_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dayPostpartum` int NOT NULL,
	`edinburghScore` int,
	`postpartumAnxietyScore` int,
	`bondingScore` int,
	`sleepHours` decimal(4,2),
	`physicalSymptoms` json,
	`feedingBurnout` int,
	`returnToWorkAnxiety` int,
	`metricDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postpartum_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postpartum_support_plan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postpartumDoula` varchar(255),
	`therapist` varchar(255),
	`supportGroup` varchar(255),
	`emergencyContacts` json,
	`planDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `postpartum_support_plan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pregnancy_loss_grief` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lossDate` timestamp NOT NULL,
	`lossType` enum('miscarriage','stillbirth','termination') NOT NULL,
	`weekOfPregnancy` int,
	`griefStage` enum('denial','anger','bargaining','depression','acceptance') NOT NULL DEFAULT 'denial',
	`griefIntensity` int,
	`supportGroups` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pregnancy_loss_grief_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pregnancy_medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`medicationName` varchar(255) NOT NULL,
	`dosage` varchar(255),
	`frequency` varchar(255),
	`safetyStatus` enum('safe','caution','avoid','unknown') NOT NULL DEFAULT 'unknown',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pregnancy_medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pregnancy_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bodyImageScore` int,
	`relationshipSatisfaction` int,
	`laborAnxiety` int,
	`perinatalAnxietyScore` int,
	`hormoneLevel` varchar(50),
	`ppdRiskScore` decimal(5,2),
	`ppdRiskFactors` json,
	`prenatalCareAdherence` int,
	`metricDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pregnancy_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pregnancy_support_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupName` varchar(255) NOT NULL,
	`groupType` varchar(255),
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pregnancy_support_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pregnancy_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pregnancyStatus` enum('not_pregnant','pregnant','postpartum','not_trying') NOT NULL DEFAULT 'not_pregnant',
	`pregnancyWeek` int,
	`trimester` enum('first','second','third'),
	`dueDate` timestamp,
	`lastMenstrualPeriod` timestamp,
	`hasHistoryOfMiscarriage` boolean NOT NULL DEFAULT false,
	`hasHistoryOfPPD` boolean NOT NULL DEFAULT false,
	`hasHistoryOfMentalIllness` boolean NOT NULL DEFAULT false,
	`highRiskPregnancy` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pregnancy_tracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `pregnancy_tracking_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `prenatal_appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentType` varchar(255),
	`appointmentDate` timestamp NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`notes` text,
	`testResults` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prenatal_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychedelic_integration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionDate` timestamp NOT NULL,
	`substanceType` varchar(255),
	`dosage` varchar(255),
	`integrationStage` enum('pre_session','during_session','post_session','integrated') NOT NULL DEFAULT 'pre_session',
	`insights` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `psychedelic_integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_architecture` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`remSleep` decimal(5,2),
	`deepSleep` decimal(5,2),
	`lightSleep` decimal(5,2),
	`sleepQuality` int,
	`recommendations` json,
	`sleepDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleep_architecture_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_network_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`relationship` varchar(255),
	`stressImpact` int,
	`supportLevel` int,
	`boundaryRecommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_network_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_support_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`socialConnectionScore` int,
	`isolationLevel` int,
	`socialEngagements` int,
	`metricDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_support_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trauma_informed_care` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`traumaHistory` text,
	`traumaType` varchar(255),
	`identifiedTriggers` json,
	`safeInterventions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trauma_informed_care_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`audioUrl` text NOT NULL,
	`transcription` text,
	`duration` int,
	`tone` varchar(255),
	`pitch` decimal(5,2),
	`speed` decimal(5,2),
	`detectedEmotions` json,
	`emotionScore` decimal(5,2),
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voice_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` int NOT NULL,
	`heartRateVariability` decimal(5,2),
	`sleepQuality` int,
	`stressLevel` int,
	`activityMinutes` int,
	`dataDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceType` enum('apple_watch','fitbit','oura_ring','whoop','other') NOT NULL,
	`deviceName` varchar(255),
	`connected` boolean NOT NULL DEFAULT false,
	`connectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wearable_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workplace_accommodations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accommodationType` varchar(255),
	`requested` boolean NOT NULL DEFAULT false,
	`approved` boolean NOT NULL DEFAULT false,
	`employerCommunication` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workplace_accommodations_id` PRIMARY KEY(`id`)
);
