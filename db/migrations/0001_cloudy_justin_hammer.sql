CREATE TABLE `beach_key_features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`beach_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`beach_id`) REFERENCES `beaches`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `beach_key_features_beach_idx` ON `beach_key_features` (`beach_id`);--> statement-breakpoint
CREATE TABLE `beach_nearby_attractions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`beach_id` text NOT NULL,
	`name` text NOT NULL,
	`distance` real,
	`type` text NOT NULL,
	`description` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`beach_id`) REFERENCES `beaches`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `beach_nearby_attractions_beach_idx` ON `beach_nearby_attractions` (`beach_id`);--> statement-breakpoint
CREATE TABLE `beach_visiting_tips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`beach_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text,
	`is_warning` integer DEFAULT false NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`beach_id`) REFERENCES `beaches`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `beach_visiting_tips_beach_idx` ON `beach_visiting_tips` (`beach_id`);--> statement-breakpoint
ALTER TABLE `beaches` ADD `description_long` text;--> statement-breakpoint
ALTER TABLE `beaches` ADD `water_characteristics` text;--> statement-breakpoint
ALTER TABLE `beaches` ADD `sand_quality` text;--> statement-breakpoint
ALTER TABLE `beaches` ADD `crowd_level` text;--> statement-breakpoint
ALTER TABLE `beaches` ADD `best_time_to_visit` text;