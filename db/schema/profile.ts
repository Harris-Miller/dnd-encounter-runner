import { sql } from 'drizzle-orm';
import { boolean, char, jsonb, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidPk } from '../column.utils.ts';
import { users } from '../transient/auth.ts';

export const profileAvatarSourceEnum = pgEnum('profile_avatar_source', ['oauth', 'uploaded']);

export const profiles = pgTable.withRLS('profiles', {
  avatarSource: profileAvatarSourceEnum().notNull().default('oauth'),
  createdAt: createdAt(),
  email: text().unique().notNull(),
  gravatarId: char({ length: 64 }),
  id: uuidPk(),
  name: text(),
  updatedAt: updatedAt(),
  uploadedAvatarId: uuid('uploaded_avatar_id'),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const encounters = pgTable.withRLS('encounters', {
  active: boolean().notNull().default(false),
  createdAt: createdAt(),
  id: uuidPk(),
  name: text().notNull().default('Untitled Encounter'),
  profileId: uuidFkCascade(() => profiles.id),
  state: jsonb().notNull().default(sql`'{}'::jsonb`),
  updatedAt: updatedAt(),
});
