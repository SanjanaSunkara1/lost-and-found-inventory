import { sql } from "drizzle-orm";
import { 
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  serial
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  studentId: varchar("student_id").unique(),
  password: varchar("password"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["staff", "student"] }).notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lost and found items
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { 
    enum: ["electronics", "clothing", "books", "accessories", "sports", "jewelry", "other"] 
  }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  photoUrl: varchar("photo_url"),
  priority: varchar("priority", { enum: ["normal", "high"] }).notNull().default("normal"),
  status: varchar("status", { enum: ["active", "claimed", "archived"] }).notNull().default("active"),
  staffNotes: text("staff_notes"),
  foundById: varchar("found_by_id").references(() => users.id),
  claimedById: varchar("claimed_by_id").references(() => users.id),
  dateFound: timestamp("date_found").notNull(),
  dateArchived: timestamp("date_archived"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Claims for items
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "more_info_needed"] }).notNull().default("pending"),
  staffNotes: text("staff_notes"),
  reviewedById: varchar("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["info", "success", "warning", "error"] }).notNull().default("info"),
  read: boolean("read").notNull().default(false),
  relatedItemId: integer("related_item_id").references(() => items.id),
  relatedClaimId: integer("related_claim_id").references(() => claims.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  itemsFound: many(items, { relationName: "foundBy" }),
  itemsClaimed: many(items, { relationName: "claimedBy" }),
  claims: many(claims, { relationName: "claimant" }),
  claimsReviewed: many(claims, { relationName: "reviewer" }),
  notifications: many(notifications),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  foundBy: one(users, { 
    fields: [items.foundById], 
    references: [users.id],
    relationName: "foundBy"
  }),
  claimedBy: one(users, { 
    fields: [items.claimedById], 
    references: [users.id],
    relationName: "claimedBy"
  }),
  claims: many(claims),
  notifications: many(notifications),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  item: one(items, { 
    fields: [claims.itemId], 
    references: [items.id] 
  }),
  student: one(users, { 
    fields: [claims.studentId], 
    references: [users.id],
    relationName: "claimant"
  }),
  reviewedBy: one(users, { 
    fields: [claims.reviewedById], 
    references: [users.id],
    relationName: "reviewer"
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { 
    fields: [notifications.userId], 
    references: [users.id] 
  }),
  relatedItem: one(items, { 
    fields: [notifications.relatedItemId], 
    references: [items.id] 
  }),
  relatedClaim: one(claims, { 
    fields: [notifications.relatedClaimId], 
    references: [claims.id] 
  }),
}));

// Schemas for validation
export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dateArchived: true,
}).extend({
  dateFound: z.string().transform((str) => new Date(str)),
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  reviewedById: true,
  staffNotes: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const updateClaimSchema = createInsertSchema(claims).omit({
  id: true,
  itemId: true,
  studentId: true,
  description: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Custom signup schema with validation
export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  studentId: z.string().refine(
    (val) => /^s\d{6}$/.test(val),
    "Student ID must start with 's' followed by 6 digits (e.g., s123456)"
  ),
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).refine(
  (data) => {
    const expectedEmail = `${data.studentId}@student.roundrockisd.org`;
    return data.email === expectedEmail;
  },
  {
    message: "Email must be your student ID followed by @student.roundrockisd.org",
    path: ["email"],
  }
);

export const loginSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type UpdateClaim = z.infer<typeof updateClaimSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
