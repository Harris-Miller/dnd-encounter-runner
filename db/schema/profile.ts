import { char, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { users } from '../transient/auth.ts';

export const profileAvatarSourceEnum = pgEnum('profile_avatar_source', ['oauth', 'uploaded']);

export const profiles = pgTable.withRLS('profiles', {
  avatarSource: profileAvatarSourceEnum().notNull().default('oauth'),
  gravatarId: char({ length: 64 }),
  id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text(),
  uploadedAvatarId: uuid('uploaded_avatar_id'),
});
