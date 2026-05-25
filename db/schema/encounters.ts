import { boolean, jsonb, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidPk } from '../column.utils.ts';
import { EMPTY_ENCOUNTER_STATE } from '../encounterStateDefault.ts';

import { profiles } from './profile.ts';

export const encounters = pgTable.withRLS('encounters', {
  active: boolean().notNull().default(false),
  createdAt: createdAt(),
  id: uuidPk(),
  name: text().notNull().default('Untitled Encounter'),
  profileId: uuidFkCascade(() => profiles.id),
  state: jsonb().notNull().default(EMPTY_ENCOUNTER_STATE),
  updatedAt: updatedAt(),
});
