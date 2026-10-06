CREATE TABLE `board_comment` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `board_post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `board_comment_post_id_created_at_idx` ON `board_comment` (`post_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `board_post` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `board_post_kind_created_at_idx` ON `board_post` (`kind`,`created_at`);--> statement-breakpoint
CREATE TABLE `uploaded_file` (
	`key` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`purpose` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `uploaded_file_owner_id_created_at_idx` ON `uploaded_file` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `user_block` (
	`blocker_id` text NOT NULL,
	`blocked_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`blocker_id`, `blocked_id`),
	FOREIGN KEY (`blocker_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blocked_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_follow` (
	`follower_id` text NOT NULL,
	`followee_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`follower_id`, `followee_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`followee_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_follow_followee_id_idx` ON `user_follow` (`followee_id`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`handle` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`avatar_key` text,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_handle_unique` ON `user_profile` (`handle`);--> statement-breakpoint
ALTER TABLE `user_record_revision` ADD `updated_at` text;--> statement-breakpoint
INSERT INTO `user_profile` (`user_id`, `handle`, `bio`, `is_public`, `created_at`, `updated_at`) SELECT `id`, 'user_' || substr(lower(replace(`id`, '-', '')), 1, 12), '', 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now') FROM `user` WHERE `id` NOT IN (SELECT `user_id` FROM `user_profile`);
--> statement-breakpoint
UPDATE `user_record_revision` SET `updated_at` = (SELECT max(`updated_at`) FROM `user_record` WHERE `user_record`.`user_id` = `user_record_revision`.`user_id`) WHERE `updated_at` IS NULL;
