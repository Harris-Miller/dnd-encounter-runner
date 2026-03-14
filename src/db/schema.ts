import { relations } from 'drizzle-orm';
import { boolean, char, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { ulid as getUlid } from 'ulid';

const ulid = () => char({ length: 26 });

export const users = pgTable('users', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  email: text().unique(),
  emailVerified: boolean().default(false),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  image: text(),
  name: text(),
  passwordHash: text(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    accessToken: text(),
    expiresAt: timestamp({ withTimezone: true }),
    id: ulid()
      .primaryKey()
      .$defaultFn(() => getUlid()),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text(),
    userId: ulid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  t => [unique().on(t.provider, t.providerAccountId)],
);

export const sessions = pgTable('sessions', {
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  token: text().notNull().unique(),
  userId: ulid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
