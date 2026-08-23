import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const guests = pgTable("guests", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  attending: boolean().notNull(),
  message: text(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const views = pgTable("views", {
  id: serial().primaryKey(),
  ip: text(),
  page: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
