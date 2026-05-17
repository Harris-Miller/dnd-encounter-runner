import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidPk } from '../column.utils.ts';
import { users } from '../transient/auth.ts';

export const profileAvatarSourceEnum = pgEnum('profile_avatar_source', ['oauth', 'uploaded']);

export const profiles = pgTable.withRLS('profiles', {
  avatarSource: profileAvatarSourceEnum().notNull().default('oauth'),
  createdAt: createdAt(),
  email: text().unique().notNull(),
  id: uuidPk(),
  name: text(),
  updatedAt: updatedAt(),
  uploadedAvatarId: uuid('uploaded_avatar_id'),
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
