import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { uuidFkCascade, uuidPk } from '../column.utils';
import { users } from '../transient/auth';

export const profiles = pgTable.withRLS('profiles', {
  avatarUrl: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  email: text().unique(),
  id: uuidPk(),
  name: text(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const encounters = pgTable.withRLS('encounters', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  id: uuidPk(),
  profileId: uuidFkCascade(() => profiles.id),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`),
});
