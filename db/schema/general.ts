import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { uuidPk } from '../column.utils';

export const damageTypes = pgTable('damage_types', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  id: uuidPk(),
  name: text().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`),
});
