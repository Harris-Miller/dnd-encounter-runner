import { boolean, jsonb, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidPk } from '../column.utils.ts';

import { campaigns } from './campaigns.ts';
import { profiles } from './profile.ts';

const EMPTY_ENCOUNTER_STATE = {
  combatants: {},
  events: [],
  initiativeOrder: [],
  reminders: [],
  round: 1,
  turnIndex: 0,
} as const;

export const encounters = pgTable.withRLS('encounters', {
  active: boolean().notNull().default(false),
  campaignId: uuidFkCascade(() => campaigns.id),
  createdAt: createdAt(),
  id: uuidPk(),
  name: text().notNull().default('Untitled Encounter'),
  profileId: uuidFkCascade(() => profiles.id),
  state: jsonb().notNull().default(EMPTY_ENCOUNTER_STATE),
  updatedAt: updatedAt(),
});
