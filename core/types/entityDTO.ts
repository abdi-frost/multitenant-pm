import { TenantStatus } from "./entityEnums";
import { employees, organizations, tenants, users } from "@/db/schema"

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseEntityDTO {
    id: string;
    metadata: Record<string, any>;
    deleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ModerationLog = {
    action: TenantStatus;
    by: string;
    reason?: string;
    at: string;
}

export type NewTenantDTO = typeof tenants.$inferInsert;
export type TenantDTO = typeof tenants.$inferSelect;
export type NewOrganizationDTO = typeof organizations.$inferInsert;
export type OrganizationDTO = typeof organizations.$inferSelect;
export type NewEmployeeDTO = typeof employees.$inferInsert;
export type EmployeeDTO = typeof employees.$inferSelect;
export type NewUserDTO = typeof users.$inferInsert;
export type UserDTO = typeof users.$inferSelect;
export type AdminCreateTenantDTO = {
    tenant: NewTenantDTO;
    organization: NewOrganizationDTO;
    user: NewUserDTO;
}