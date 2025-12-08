import { boolean, pgTable, uuid, varchar, timestamp, json, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
    deletedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
}

const systemFields = {
    isActive: boolean().notNull().default(true),
    metadata: json(),
    deleted: boolean().notNull().default(false),
    ...timestamps
}

// ============================================================================
// BETTER AUTH TABLES
// ============================================================================

// Core user table for Better Auth - supports both admins and tenant users
export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    
    // Custom fields for our multi-tenant system
    userType: varchar("userType", { length: 20 }).notNull().default("TENANT"), // ADMIN | TENANT | EMPLOYEE
    tenantId: varchar("tenantId", { length: 36 }), // References tenantsTable.id
    organizationId: uuid("organizationId"), // References organizationsTable.id
    role: varchar("role", { length: 50 }), // For employees: STAFF | MANAGER | ADMIN
});

// Session management for Better Auth
export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// OAuth account linking for social auth
export const accountTable = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(), // google, github, etc.
    userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    expiresAt: timestamp("expiresAt"),
    password: text("password"), // For email/password auth
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Email verification tokens
export const verificationTable = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ============================================================================
// TENANT & ORGANIZATION TABLES
// ============================================================================

export const tenantsTable = pgTable("tenants", {
    id: varchar({ length: 36 }).notNull().primaryKey().unique(),
    uuid: uuid().notNull().defaultRandom().unique(),
    status: varchar({ length: 20 }).notNull().default("PENDING"), // PENDING | APPROVED | REJECTED
    requestedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp({ withTimezone: true }),
    approvedBy: text(), // Reference to admin user.id who approved
    rejectedAt: timestamp({ withTimezone: true }),
    rejectedBy: text(), // Reference to admin user.id who rejected
    rejectionReason: text(),
    
    // Subscription & limits (for SaaS)
    subscriptionTier: varchar({ length: 50 }).default("FREE"), // FREE | BASIC | PREMIUM | ENTERPRISE
    maxEmployees: integer().default(5),
    maxProjects: integer().default(10),
    subscriptionExpiresAt: timestamp({ withTimezone: true }),
    
    ...systemFields
});

export const organizationsTable = pgTable("organizations", {
    tenantId: varchar({ length: 36 }).notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
    id: uuid().primaryKey().defaultRandom().unique(),
    name: varchar({ length: 256 }).notNull(),
    description: varchar({ length: 1024 }),
    logoUrl: varchar({ length: 512 }),
    website: varchar({ length: 512 }),
    industry: varchar({ length: 100 }),
    size: varchar({ length: 50 }), // SMALL | MEDIUM | LARGE | ENTERPRISE
    preferences: json(),
    ...systemFields
});

// ============================================================================
// INVITATION & ONBOARDING TABLES
// ============================================================================

export const onboardingRequestsTable = pgTable("onboarding_requests", {
    tenantId: varchar({ length: 36 }).notNull().references(() => tenantsTable.id),
    id: uuid().primaryKey().notNull().defaultRandom().unique(),
    description: varchar({ length: 1024 }),
    companyDetails: json(), // Additional company information
    businessType: varchar({ length: 100 }),
    expectedUsers: integer(),
    ...systemFields
});

// Employee invitation system
export const invitationsTable = pgTable("invitations", {
    id: uuid().primaryKey().defaultRandom().unique(),
    tenantId: varchar({ length: 36 }).notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
    organizationId: uuid().notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
    email: varchar({ length: 256 }).notNull(),
    role: varchar({ length: 50 }).notNull().default("STAFF"), // STAFF | MANAGER
    invitedBy: text().notNull().references(() => userTable.id),
    invitationToken: varchar({ length: 512 }).notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    acceptedAt: timestamp({ withTimezone: true }),
    status: varchar({ length: 20 }).notNull().default("PENDING"), // PENDING | ACCEPTED | EXPIRED | REVOKED
    ...systemFields
});

// ============================================================================
// RELATIONS
// ============================================================================

export const userRelations = relations(userTable, ({ one, many }) => ({
    tenant: one(tenantsTable, {
        fields: [userTable.tenantId],
        references: [tenantsTable.id],
    }),
    organization: one(organizationsTable, {
        fields: [userTable.organizationId],
        references: [organizationsTable.id],
    }),
    sessions: many(sessionTable),
    accounts: many(accountTable),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id],
    }),
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
    user: one(userTable, {
        fields: [accountTable.userId],
        references: [userTable.id],
    }),
}));

export const tenantsRelations = relations(tenantsTable, ({ one, many }) => ({
    organization: one(organizationsTable),
    users: many(userTable),
    onboardingRequest: one(onboardingRequestsTable),
    invitations: many(invitationsTable),
}));

export const organizationsRelations = relations(organizationsTable, ({ one, many }) => ({
    tenant: one(tenantsTable, {
        fields: [organizationsTable.tenantId],
        references: [tenantsTable.id],
    }),
    users: many(userTable),
    invitations: many(invitationsTable),
}));

export const onboardingRequestsRelations = relations(onboardingRequestsTable, ({ one }) => ({
    tenant: one(tenantsTable, {
        fields: [onboardingRequestsTable.tenantId],
        references: [tenantsTable.id],
    }),
}));

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
    tenant: one(tenantsTable, {
        fields: [invitationsTable.tenantId],
        references: [tenantsTable.id],
    }),
    organization: one(organizationsTable, {
        fields: [invitationsTable.organizationId],
        references: [organizationsTable.id],
    }),
    invitedBy: one(userTable, {
        fields: [invitationsTable.invitedBy],
        references: [userTable.id],
    }),
}));
