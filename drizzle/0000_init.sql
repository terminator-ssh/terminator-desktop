CREATE TABLE `encrypted_blobs` (
	`id` text PRIMARY KEY NOT NULL,
	`blob` text NOT NULL,
	`iv` text NOT NULL,
	`updated_at` text NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`version_id` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`key_salt` text NOT NULL,
	`auth_salt` text,
	`encrypted_master_key` text NOT NULL,
	`login_hash` text NOT NULL
);
