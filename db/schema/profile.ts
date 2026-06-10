import { char, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidPk } from '../column.utils.ts';
import { users } from '../transient/auth.ts';

export const profileAvatarSourceEnum = pgEnum('profile_avatar_source', ['oauth', 'uploaded']);

export const profiles = pgTable.withRLS('profiles', {
  avatarSource: profileAvatarSourceEnum().notNull().default('oauth'),
  createdAt: createdAt(),
  gravatarId: char({ length: 64 }),
  id: uuidPk(),
  name: text(),
  updatedAt: updatedAt(),
  uploadedAvatarId: uuid('uploaded_avatar_id'),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
});
