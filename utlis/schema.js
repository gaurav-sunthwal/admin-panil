import { pgTable, varchar, integer, boolean } from "drizzle-orm/pg-core";

// Define the Users table structure
export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("isAdmin").notNull().default(false),
});



