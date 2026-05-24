CREATE TABLE
  IF NOT EXISTS `USERS` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `username` TEXT NOT NULL,
    `loginType` TEXT CHECK (`loginType` in ('email', 'google')) NOT NULL,
    `colour` TEXT NOT NULL DEFAULT '000000'
  );

INSERT
OR IGNORE INTO sqlite_sequence (name, seq)
VALUES
  ('USERS', 999);

CREATE TABLE
  IF NOT EXISTS `GROUPS` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `display` TEXT NOT NULL,
    `owner` INTEGER NOT NULL REFERENCES USERS (id),
    `public` BOOLEAN DEFAULT 0
  );

INSERT
OR IGNORE INTO sqlite_sequence (name, seq)
VALUES
  ('GROUPS', 999);

CREATE TABLE
  IF NOT EXISTS `USER_GROUPS` (
    `user_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `role` TEXT CHECK (`role` IN ('gm', 'writer', 'player', 'observer')) NOT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES USERS (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES GROUPS (id) ON DELETE CASCADE
  );