import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../auth/auth-schema";
import { TenantStatus, UserRole, UserStatus } from "@/types/entityEnums";
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
    role: text("role").notNull().default(UserRole.MEMBER),
    status: text("status").notNull().default(UserStatus.INVITED),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    ...systemFields
}, (t) => {
    return {
        uniqueEmployee: uniqueIndex("unique_employee").on(t.tenantId, t.userId),
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
