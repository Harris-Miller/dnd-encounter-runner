import { pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidPk } from '../column.utils.ts';

export const damageTypes = pgTable.withRLS('damage_types', {
  createdAt: createdAt(),
  id: uuidPk(),
  name: text().notNull(),
  updatedAt: updatedAt(),
});
