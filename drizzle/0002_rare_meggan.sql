CREATE TABLE `user_display_preference` (
	`user_id` text PRIMARY KEY NOT NULL,
	`version_display` text DEFAULT 'logo' NOT NULL,
	`logo_opacity` integer DEFAULT 70 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `user_record` ADD `score_grade` text;