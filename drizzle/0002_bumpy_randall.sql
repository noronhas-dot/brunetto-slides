CREATE TABLE `credentials` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`username` varchar(255) NOT NULL,
	`passwordHash` text NOT NULL,
	`name` text,
	`email` varchar(320),
	`role` varchar(64) NOT NULL DEFAULT 'viewer',
	`createdAt` timestamp DEFAULT (now()),
	`lastSignedIn` timestamp,
	CONSTRAINT `credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `credentials_username_unique` UNIQUE(`username`)
);
