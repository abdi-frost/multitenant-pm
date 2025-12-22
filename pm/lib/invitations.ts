import { coreApiClient } from "@/lib/api.client";
import type { DataResponse, ListResponse } from "@/types/response";
import type {
  AcceptInvitationExistingUserInput,
  AcceptInvitationSignupInput,
  CreateInvitationInput,
  EmployeeRole,
  Invitation,
  InvitationDetails,
  InvitationListQuery,
} from "@/types/invitation";

export async function listInvitations(params: InvitationListQuery = {}) {
  const res = await coreApiClient.get<ListResponse<Invitation>>("/invitations", { params });
  return res.data;
}

export async function createInvitation(payload: CreateInvitationInput) {
  const res = await coreApiClient.post<DataResponse<{ invitation: Invitation; token: string; invitationUrl: string }>>(
    "/invitations",
    payload,
  );
  return res.data;
}

export async function resendInvitation(invitationId: string) {
  const res = await coreApiClient.post<DataResponse<{ invitation: Invitation; token: string; invitationUrl: string }>>(
    `/invitations/${invitationId}/resend`,
  );
  return res.data;
}

export async function revokeInvitation(invitationId: string) {
  const res = await coreApiClient.delete<DataResponse<{ invitation: Invitation }>>(`/invitations/${invitationId}`);
  return res.data;
}

export async function updateInvitationRole(invitationId: string, role: EmployeeRole) {
  const res = await coreApiClient.patch<DataResponse<{ invitation: Invitation }>>(`/invitations/${invitationId}`, {
    role,
  });
  return res.data;
}

export async function getInvitationByToken(token: string) {
  const res = await coreApiClient.get<DataResponse<InvitationDetails>>(`/invitations/${token}`);
  return res.data;
}

export async function validateInvitationToken(token: string) {
  const res = await coreApiClient.get<DataResponse<{ valid: boolean; invitation?: Invitation }>>(
    `/invitations/${token}/validate`,
  );
  return res.data;
}

export async function acceptInvitation(token: string, payload: AcceptInvitationSignupInput | AcceptInvitationExistingUserInput) {
  const res = await coreApiClient.post<
    DataResponse<{ invitation?: Invitation; employee?: unknown; user?: unknown }>
  >(`/invitations/${token}/accept`, payload);
  return res.data;
}

export async function checkInvitationByEmail(email: string) {
  const res = await coreApiClient.get<DataResponse<{ invited: boolean; invitation?: Invitation }>>("/invitations/check", {
    params: { email },
  });
  return res.data;
}
