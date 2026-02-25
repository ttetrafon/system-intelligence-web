ALTER TABLE `USERS` ADD COLUMN `system_role` TEXT CHECK(`system_role` IN ('owner', 'admin', 'user')) NOT NULL DEFAULT 'user';
