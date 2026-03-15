import { char } from 'drizzle-orm/pg-core';
import type { ReferenceConfig } from 'drizzle-orm/pg-core';
import { ulid as getUlid } from 'ulid';

export const ulid = () => char({ length: 26 });

export const ulidPk = () =>
  ulid()
    .primaryKey()
    .$defaultFn(() => getUlid());

export const ulidFk = (ref: ReferenceConfig['ref']) => ulid().notNull().references(ref, { onDelete: 'cascade' });
