CREATE TABLE `user_record_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`chart_id` text NOT NULL,
	`lamp` text NOT NULL,
	`score_grade` text,
	`ex_score` integer,
	`miss_count` integer,
	`source` text NOT NULL,
	`import_id` integer,
	`recorded_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`import_id`) REFERENCES `eamusement_import`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_record_history_user_id_chart_id_id_idx` ON `user_record_history` (`user_id`,`chart_id`,`id`);--> statement-breakpoint
CREATE TABLE `eamusement_import` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`channel` text NOT NULL,
	`game_version` integer NOT NULL,
	`style` integer NOT NULL,
	`generated_at` text NOT NULL,
	`dj_name` text,
	`iidx_id` text,
	`dan_rank` text,
	`dj_point` real,
	`play_count_sp` integer,
	`play_count_dp` integer,
	`radar_notes` real,
	`radar_chord` real,
	`radar_peak` real,
	`radar_charge` real,
	`radar_scratch` real,
	`radar_soflan` real,
	`received_count` integer NOT NULL,
	`matched_count` integer NOT NULL,
	`changed_count` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `eamusement_import_user_id_id_idx` ON `eamusement_import` (`user_id`,`id`);--> statement-breakpoint
ALTER TABLE `user_record` ADD `ex_score` integer;--> statement-breakpoint
ALTER TABLE `user_record` ADD `miss_count` integer;--> statement-breakpoint
ALTER TABLE `user_record` ADD `source` text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
INSERT INTO `user_record_history` (`user_id`, `chart_id`, `lamp`, `score_grade`, `ex_score`, `miss_count`, `source`, `import_id`, `recorded_at`) SELECT `user_id`, `chart_id`, `lamp`, `score_grade`, NULL, NULL, 'manual', NULL, `updated_at` FROM `user_record` ORDER BY `updated_at`, `user_id`, `chart_id`;
