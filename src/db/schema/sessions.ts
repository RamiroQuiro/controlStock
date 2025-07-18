import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  expiresAt: text('expiresAt')
    .notNull()
    .default(sql`(current_timestamp)`),
});
