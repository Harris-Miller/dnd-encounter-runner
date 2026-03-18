import { sql } from 'drizzle-orm';
import { timestamp, uuid } from 'drizzle-orm/pg-core';
import type { ReferenceConfig } from 'drizzle-orm/pg-core';

export const uuidPk = () => uuid().defaultRandom().primaryKey();

export const uuidFk = (ref: ReferenceConfig['ref']) => uuid().notNull().references(ref);

export const uuidFkCascade = (ref: ReferenceConfig['ref']) => uuid().notNull().references(ref, { onDelete: 'cascade' });

export const createdAt = () => timestamp({ withTimezone: true }).defaultNow();

export const updatedAt = () =>
  timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`);
