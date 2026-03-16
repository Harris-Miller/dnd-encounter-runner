import { pgTable, text } from 'drizzle-orm/pg-core';

import { ulidPk } from '../column.utils';

export const damageTypes = pgTable('damage_types', {
  id: ulidPk(),
  name: text().notNull(),
});
