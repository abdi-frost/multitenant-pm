import { NextRequest } from "next/server";
import {
    requireAuth,
    handleApiError,
    createApiResponse,
    createErrorResponse,
} from "@/lib/api-helpers";
import {
    acceptInvitation,
    getInvitationByToken,
    revokeInvitation,
} from "@/db/repositories/invitation.repository";
import { AcceptInvitationDTO } from "@/types/entityDTO";

/**
 * GET /api/invitations/[token]
 * Get invitation details by token
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const result = await getInvitationByToken(params.token);
        
        return createApiResponse(result.data);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/invitations/[token]/accept
 * Accept an invitation
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        
        const acceptData: AcceptInvitationDTO = {
            invitationToken: params.token,
            name: body.name || user.name,
            password: body.password,
        };
        
        const result = await acceptInvitation(acceptData);
        
        return createApiResponse(result.data, 200, "Invitation accepted successfully");
    } catch (error) {
        return handleApiError(error);
    }
}
