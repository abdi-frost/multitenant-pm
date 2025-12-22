import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../auth/auth-schema";
import { EmployeeRole, InvitationStatus, TenantStatus, UserRole, UserStatus } from "@/types/entityEnums";
import { systemFields } from "../core/sysytem-schema";

export const tenants = pgTable("tenants", {
    id: text("id").primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    status: text("status").notNull().default(TenantStatus.PENDING),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    moderationLog: jsonb("moderation_log")
        .$type<
            {
                action: TenantStatus;
                by: string;
                reason?: string;
                at: string;
            }[]
        >()
        .notNull()
        .default([]),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    ...systemFields
});

export const employees = pgTable("employees", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    // Note: this field stores tenant-employee permission level (STAFF/MANAGER/ADMIN).
    // `users.role` stores platform-level role (e.g. TENANT_ADMIN).
    role: text("role").notNull().default(EmployeeRole.STAFF),
    status: text("status").notNull().default(UserStatus.INVITED),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    ...systemFields
}, (t) => {
    return {
        uniqueEmployee: uniqueIndex("unique_employee").on(t.tenantId, t.userId),
    };
});

export const invitations = pgTable("invitations", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    role: text("role").notNull().default(EmployeeRole.STAFF),
    status: text("status").notNull().default(InvitationStatus.PENDING),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    invitedByUserId: text("invited_by_user_id").references(() => users.id, { onDelete: "set null" }),
    ...systemFields
}, (t) => {
    return {
        uniqueInvitationEmailPerTenant: uniqueIndex("unique_invitation_email_per_tenant").on(t.tenantId, t.email),
    };
});


export const organizations = pgTable("organizations", {
    tenantId: text("tenant_id").primaryKey().references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    legalName: text("legal_name"),
    country: text("country").default('ET'),
    address: jsonb("address"),
    phone: text("phone"),
    logoUrl: text("logo_url"),
    website: text("website"),
    preferences: jsonb("preferences").default({}),
    ...systemFields
});

// Relations
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [tenants.id],
        references: [organizations.tenantId]
    }),
    employees: many(employees),
    invitations: many(invitations),
    owner: one(users, {
        fields: [tenants.ownerId],
        references: [users.id]
    }),
    createdBy: one(users, {
        fields: [tenants.createdBy],
        references: [users.id]
    })
}));

export const organizationsRelations = relations(organizations, ({ one }) => ({
    tenant: one(tenants, {
        fields: [organizations.tenantId],
        references: [tenants.id]
    })
}));

export const employeesRelations = relations(employees, ({ one }) => ({
    tenant: one(tenants, {
        fields: [employees.tenantId],
        references: [tenants.id]
    }),
    user: one(users, {
        fields: [employees.userId],
        references: [users.id]
    })
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    tenant: one(tenants, {
        fields: [invitations.tenantId],
        references: [tenants.id]
    }),
    invitedBy: one(users, {
        fields: [invitations.invitedByUserId],
        references: [users.id]
    })
}));
