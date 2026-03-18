import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidPk } from '../column.utils';
import { users } from '../transient/auth';

export const profiles = pgTable.withRLS('profiles', {
  avatarUrl: text(),
  createdAt: createdAt(),
  email: text().unique(),
  id: uuidPk(),
  name: text(),
  updatedAt: updatedAt(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const encounters = pgTable.withRLS('encounters', {
  createdAt: createdAt(),
  id: uuidPk(),
  profileId: uuidFkCascade(() => profiles.id),
  updatedAt: updatedAt(),
});
