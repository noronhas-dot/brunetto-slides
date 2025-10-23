CREATE TABLE `activity_log` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(64) NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`metadata` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`subdomain` varchar(64) NOT NULL,
	`logoUrl` text,
	`primaryColor` varchar(7) DEFAULT '#1A3123',
	`secondaryColor` varchar(7) DEFAULT '#8B9B88',
	`accentColor` varchar(7) DEFAULT '#F9EAD3',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_subdomain_unique` UNIQUE(`subdomain`)
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`slideId` varchar(64) NOT NULL,
	`pageTitle` varchar(255) NOT NULL,
	`summary` text,
	`htmlPath` text NOT NULL,
	`imagePaths` json,
	`isNew` boolean DEFAULT false,
	`isMoved` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slides_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_org_slide` UNIQUE(`organizationId`,`slideId`)
);
--> statement-breakpoint
CREATE TABLE `template_slides` (
	`id` varchar(64) NOT NULL,
	`templateId` varchar(64) NOT NULL,
	`slideId` varchar(64) NOT NULL,
	`position` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `template_slides_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_template_slide` UNIQUE(`templateId`,`slideId`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`isDefault` boolean DEFAULT false,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('owner','admin','editor','viewer') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` varchar(64);