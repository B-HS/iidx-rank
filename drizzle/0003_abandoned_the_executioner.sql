PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_display_preference` (
	`user_id` text PRIMARY KEY NOT NULL,
	`version_display` text DEFAULT 'logo' NOT NULL,
	`logo_opacity` integer DEFAULT 10 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_display_preference`("user_id", "version_display", "logo_opacity", "revision", "updated_at") SELECT "user_id", "version_display", "logo_opacity", "revision", "updated_at" FROM `user_display_preference`;--> statement-breakpoint
DROP TABLE `user_display_preference`;--> statement-breakpoint
ALTER TABLE `__new_user_display_preference` RENAME TO `user_display_preference`;--> statement-breakpoint
PRAGMA foreign_keys=ON;