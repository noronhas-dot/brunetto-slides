import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Organizations (Tenants)
 * Each client is an organization with isolated data
 */
export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 64 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#1A3123"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#8B9B88"),
  accentColor: varchar("accentColor", { length: 7 }).default("#F9EAD3"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Users with organization association
 * Extended with role-based access control
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["owner", "admin", "editor", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
}, (table) => ({
  // Index for filtering users by organization - improves query performance
  organizationIdx: index("organization_idx").on(table.organizationId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Templates
 * Collections of slides organized by clients
 */
export const templates = mysqlTable("templates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  isDefault: boolean("isDefault").default(false),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  // Index for filtering templates by organization - critical for multi-tenant queries
  organizationIdx: index("template_organization_idx").on(table.organizationId),
  // Index for finding default templates quickly
  isDefaultIdx: index("template_is_default_idx").on(table.isDefault),
  // Composite index for common query pattern: organization + creation time
  orgCreatedIdx: index("template_org_created_idx").on(table.organizationId, table.createdAt),
}));

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/**
 * Slides
 * Individual slide files (HTML + images)
 */
export const slides = mysqlTable("slides", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  slideId: varchar("slideId", { length: 64 }).notNull(), // e.g., "front_page", "portfolio_overview"
  pageTitle: varchar("pageTitle", { length: 255 }).notNull(),
  summary: text("summary"),
  htmlPath: text("htmlPath").notNull(), // Path to HTML file in storage
  imagePaths: json("imagePaths").$type<string[]>(), // Array of image paths
  isNew: boolean("isNew").default(false),
  isMoved: boolean("isMoved").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  uniqueOrgSlide: uniqueIndex("unique_org_slide").on(table.organizationId, table.slideId),
  // Index for filtering slides by organization
  organizationIdx: index("slide_organization_idx").on(table.organizationId),
  // Composite index for common query pattern: organization + creation time
  orgCreatedIdx: index("slide_org_created_idx").on(table.organizationId, table.createdAt),
}));

export type Slide = typeof slides.$inferSelect;
export type InsertSlide = typeof slides.$inferInsert;

/**
 * Template Slides (N:N relationship)
 * Links slides to templates with ordering
 */
export const templateSlides = mysqlTable("template_slides", {
  id: varchar("id", { length: 64 }).primaryKey(),
  templateId: varchar("templateId", { length: 64 }).notNull(),
  slideId: varchar("slideId", { length: 64 }).notNull(),
  position: int("position").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  uniqueTemplateSlide: uniqueIndex("unique_template_slide").on(table.templateId, table.slideId),
  // Index for efficient joins on templateId - critical for getTemplateSlides query
  templateIdx: index("template_slide_template_idx").on(table.templateId),
  // Index on slideId for reverse lookups
  slideIdx: index("template_slide_slide_idx").on(table.slideId),
  // Composite index for ordering slides within a template
  templatePositionIdx: index("template_slide_position_idx").on(table.templateId, table.position),
}));

export type TemplateSlide = typeof templateSlides.$inferSelect;
export type InsertTemplateSlide = typeof templateSlides.$inferInsert;

/**
 * Activity Log (optional, for audit trail)
 * Track all actions for compliance
 */
export const activityLog = mysqlTable("activity_log", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(), // e.g., "template.create", "slide.update"
  entityType: varchar("entityType", { length: 64 }).notNull(), // e.g., "template", "slide"
  entityId: varchar("entityId", { length: 64 }).notNull(),
  metadata: json("metadata"), // Additional context
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  // Index for filtering activity by organization
  organizationIdx: index("activity_organization_idx").on(table.organizationId),
  // Index for filtering activity by user
  userIdx: index("activity_user_idx").on(table.userId),
  // Composite index for common query: organization + timestamp (for activity feeds)
  orgCreatedIdx: index("activity_org_created_idx").on(table.organizationId, table.createdAt),
}));

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

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
}, (table) => ({
  // Index for filtering credentials by organization
  organizationIdx: index("credential_organization_idx").on(table.organizationId),
}));

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = typeof credentials.$inferInsert;

