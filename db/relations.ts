import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, r => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  users: {
    accounts: r.many.accounts(),
    sessions: r.many.sessions(),
  },
}));
