import { pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidPk } from '../column.utils.ts';

import { profiles } from './profile.ts';

export const campaigns = pgTable.withRLS('campaigns', {
  createdAt: createdAt(),
  id: uuidPk(),
  name: text().notNull().default('Untitled Campaign'),
  profileId: uuidFkCascade(() => profiles.id),
  updatedAt: updatedAt(),
});
