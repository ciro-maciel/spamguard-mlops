CREATE TABLE `experiments` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT '"2025-08-18T22:03:43.749Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`experiment_id` integer NOT NULL,
	`git_commit` text,
	`metrics` text,
	`model_artifact_path` text,
	`is_production` integer DEFAULT false,
	`created_at` integer DEFAULT '"2025-08-18T22:03:43.750Z"' NOT NULL,
	FOREIGN KEY (`experiment_id`) REFERENCES `experiments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `experiments_name_unique` ON `experiments` (`name`);