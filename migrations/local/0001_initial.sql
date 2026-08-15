DROP TABLE IF EXISTS `USERS`;

DROP TABLE IF EXISTS `GROUPS`;

DROP TABLE IF EXISTS `USER_GROUPS`;

CREATE TABLE
  IF NOT EXISTS `USERS` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `username` TEXT UNIQUE NOT NULL,
    `email` TEXT UNIQUE NOT NULL,
    `login_type` TEXT NOT NULL DEFAULT 'email',
    `password_hash` TEXT NOT NULL,
    `system_role` TEXT NOT NULL DEFAULT 'user',
    `colour` TEXT NOT NULL DEFAULT '#000000'
  );

INSERT
OR IGNORE INTO sqlite_sequence (name, seq)
VALUES
  ('USERS', 100);

CREATE TABLE
  IF NOT EXISTS `GROUPS` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `display` TEXT NOT NULL,
    `owner` INTEGER NOT NULL REFERENCES USERS (username),
    `public` BOOLEAN DEFAULT 0
  );

INSERT
OR IGNORE INTO sqlite_sequence (name, seq)
VALUES
  ('GROUPS', 100);

CREATE TABLE
  IF NOT EXISTS `USER_GROUPS` (
    `group_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `role` TEXT NOT NULL DEFAULT 'observer',
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (user_id) REFERENCES USERS (user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES GROUPS (id) ON DELETE CASCADE
  );

INSERT INTO
  `USERS` (
    `username`,
    `email`,
    `login_type`,
    `password_hash`,
    `system_role`,
    `colour`
  )
VALUES
  (
    'ttetrafon',
    'ttetrafon@yahoo.gr',
    'email',
    'HFkYUYWoqPyOaNboPpghjhjQGuFFSepApj1gaqL09k8uiWyZCAosctvdKFCQh5QXXZ+oaYR6ldPAqJRHt0YWgg==',
    'owner',
    '#ffd000'
  );