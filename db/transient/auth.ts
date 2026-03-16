import { uuid } from 'drizzle-orm/pg-core';

import { authSchema } from '../dbSchemas';

// this is a built-in supabase table for auth
// by defining it like this, drizzle will automatically create a foreign key constraint to the users table
export const users = authSchema.table('users', {
  id: uuid('id').primaryKey().notNull(),
});
