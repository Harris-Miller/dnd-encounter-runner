import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { uuidFkCascade, uuidPk } from '../column.utils';
import { users } from '../transient/auth';

export const profiles = pgTable.withRLS('profiles', {
  avatarUrl: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  email: text().unique(),
  id: uuidPk(),
  name: text(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const encounters = pgTable('encounters', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  id: uuidPk(),
  profileId: uuidFkCascade(() => profiles.id),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
