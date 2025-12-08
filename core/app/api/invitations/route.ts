import { NextRequest } from "next/server";
import {
    requireTenantOwner,
    requireAuth,
    handleApiError,
    createApiResponse,
    createErrorResponse,
} from "@/lib/api-helpers";
import {
    createInvitation,
    acceptInvitation,
    getInvitationByToken,
    getInvitationsByTenant,
    revokeInvitation,
} from "@/db/repositories/invitation.repository";
import { CreateInvitationDTO, AcceptInvitationDTO } from "@/types/entityDTO";
import { EmployeeRole } from "@/types/entityEnums";

/**
 * GET /api/invitations
 * Get all invitations for the current tenant
 */
export async function GET(request: NextRequest) {
    try {
        const user = await requireTenantOwner();
        
        const result = await getInvitationsByTenant(user.tenantId!);
        
        return createApiResponse(result.data);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/invitations
 * Create a new employee invitation
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireTenantOwner();
        const body = await request.json();
        
        // Validate request
        if (!body.email || !body.role) {
            return createErrorResponse("Email and role are required", 400);
        }
        
        // Validate role
        if (!Object.values(EmployeeRole).includes(body.role)) {
            return createErrorResponse("Invalid role", 400);
        }
        
        const invitationData: CreateInvitationDTO = {
            tenantId: user.tenantId!,
            organizationId: user.organizationId!,
            email: body.email,
            role: body.role,
            invitedBy: user.id,
        };
        
        const result = await createInvitation(invitationData);
        
        return createApiResponse(result.data, 201, "Invitation created successfully");
    } catch (error) {
        return handleApiError(error);
    }
}
