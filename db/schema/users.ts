import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { ulidFk, ulidPk } from '../column.utils';

export const users = pgTable('users', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  email: text().unique(),
  emailVerified: boolean().default(false),
  id: ulidPk(),
  image: text(),
  isActive: boolean().notNull(),
  name: text(),
  passwordHash: text(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const encounters = pgTable('encounters', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  id: ulidPk(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
  userId: ulidFk(() => users.id).notNull(),
});
