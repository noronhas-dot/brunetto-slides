import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Credentials for traditional login
 * Separate from OAuth users
 */
export const credentials = mysqlTable("credentials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: varchar("role", { length: 64 }).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = typeof credentials.$inferInsert;

