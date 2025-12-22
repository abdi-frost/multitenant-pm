export enum EmployeeRole {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

export type Invitation = {
  id: string;
  tenantId?: string;
  email: string;
  role: EmployeeRole;
  status: InvitationStatus;
  firstName?: string | null;
  lastName?: string | null;
  invitedByUserId?: string | null;
  invitedByName?: string | null;
  expiresAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type CreateInvitationInput = {
  email: string;
  role: EmployeeRole;
  firstName?: string;
  lastName?: string;
};

export type InvitationListQuery = {
  status?: InvitationStatus;
  page?: number;
  limit?: number;
  search?: string;
};

export type InvitationDetails = {
  invitation: Invitation;
  organizationName?: string;
};

export type CreateInvitationResult = {
  invitation: Invitation;
  token: string;
  invitationUrl: string;
};

export type AcceptInvitationSignupInput = {
  email: string;
  password: string;
  name: string;
};

export type AcceptInvitationExistingUserInput = {
  userId: string;
};
