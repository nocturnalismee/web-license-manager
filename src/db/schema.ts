import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps,
}, (table) => [unique("users_email_unique").on(table.email)]);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
}, (table) => [
  unique("sessions_token_unique").on(table.token),
  index("sessions_user_idx").on(table.userId),
]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
}, (table) => [index("accounts_user_idx").on(table.userId)]);

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [index("verifications_identifier_idx").on(table.identifier)]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  ...timestamps,
}, (table) => [unique("organizations_slug_unique").on(table.slug)]);

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).notNull(),
  ...timestamps,
}, (table) => [
  unique("organization_members_org_user_unique").on(table.organizationId, table.userId),
  index("organization_members_user_idx").on(table.userId),
]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  publicId: varchar("public_id", { length: 40 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  ...timestamps,
}, (table) => [
  unique("products_org_slug_unique").on(table.organizationId, table.slug),
  unique("products_public_id_unique").on(table.publicId),
  index("products_org_status_idx").on(table.organizationId, table.status),
]);

export const productLicensePlans = pgTable("product_license_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  name: varchar("name", { length: 100 }).notNull(),
  priceIdr: integer("price_idr").default(0).notNull(),
  billingInterval: varchar("billing_interval", { length: 20 }).default("one_time").notNull(),
  activationLimit: integer("activation_limit").notNull(),
  durationDays: integer("duration_days").notNull(),
  features: text("features").default("{}").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  ...timestamps,
}, (table) => [index("product_license_plans_product_idx").on(table.productId)]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  email: text("email"),
  name: varchar("name", { length: 160 }),
  ...timestamps,
}, (table) => [index("customers_org_idx").on(table.organizationId)]);

export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  productLicensePlanId: uuid("product_license_plan_id").notNull().references(() => productLicensePlans.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  keyHash: text("key_hash").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  activationLimit: integer("activation_limit").notNull(),
  ...timestamps,
}, (table) => [
  unique("licenses_product_key_hash_unique").on(table.productId, table.keyHash),
  index("licenses_org_status_expiry_idx").on(table.organizationId, table.status, table.expiresAt),
]);

export const licenseActivations = pgTable("license_activations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  licenseId: uuid("license_id").notNull().references(() => licenses.id),
  installationId: varchar("installation_id", { length: 160 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  normalizedDomain: varchar("normalized_domain", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  unique("license_activations_license_installation_unique").on(table.licenseId, table.installationId),
  index("license_activations_license_status_idx").on(table.licenseId, table.status),
]);

export const platformPlans = pgTable("platform_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  priceIdr: integer("price_idr").notNull(),
  limits: text("limits").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  ...timestamps,
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  platformPlanId: uuid("platform_plan_id").notNull().references(() => platformPlans.id),
  status: varchar("status", { length: 20 }).notNull(),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  currentPeriodEndsAt: timestamp("current_period_ends_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [index("subscriptions_org_status_idx").on(table.organizationId, table.status)]);

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productId: uuid("product_id").references(() => products.id),
  name: varchar("name", { length: 100 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  keyHash: text("key_hash").notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [unique("api_keys_key_hash_unique").on(table.keyHash)]);

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: varchar("provider", { length: 40 }).notNull(),
  eventId: varchar("event_id", { length: 180 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: text("payload").notNull(),
  status: varchar("status", { length: 20 }).default("received").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [unique("webhook_events_provider_event_unique").on(table.provider, table.eventId)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  actorType: varchar("actor_type", { length: 30 }).notNull(),
  actorId: uuid("actor_id"),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 60 }).notNull(),
  resourceId: uuid("resource_id"),
  requestId: varchar("request_id", { length: 80 }),
  metadata: text("metadata"),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("audit_logs_org_created_idx").on(table.organizationId, table.createdAt)]);
