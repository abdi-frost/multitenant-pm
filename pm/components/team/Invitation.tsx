"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  createInvitation,
  listInvitations,
  resendInvitation,
  revokeInvitation,
  updateInvitationRole,
} from "@/lib/invitations";
import { EmployeeRole, InvitationStatus, type Invitation } from "@/types/invitation";

type InviteFormState = {
  email: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
};

function formatDate(value?: string | Date) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { message?: unknown } } }).response;
    const maybeMessage = maybeResponse?.data?.message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function Invitation() {
  const queryClient = useQueryClient();

  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    email: "",
    firstName: "",
    lastName: "",
    role: EmployeeRole.STAFF,
  });

  const invitationsQuery = useQuery({
    queryKey: ["invitations", "pending"],
    queryFn: () => listInvitations({ status: InvitationStatus.PENDING, page: 1, limit: 50 }),
  });

  const pendingInvitations = invitationsQuery.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: createInvitation,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to create invitation");
        return;
      }
      toast.success("Invitation created");
      setInviteForm({ email: "", firstName: "", lastName: "", role: EmployeeRole.STAFF });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to create invitation")),
  });

  const resendMutation = useMutation({
    mutationFn: (invitationId: string) => resendInvitation(invitationId),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to resend invitation");
        return;
      }
      toast.success("Invitation resent");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to resend invitation")),
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(invitationId),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to revoke invitation");
        return;
      }
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to revoke invitation")),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ invitationId, role }: { invitationId: string; role: EmployeeRole }) =>
      updateInvitationRole(invitationId, role),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to update role");
        return;
      }
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to update role")),
  });

  const isBusy =
    invitationsQuery.isFetching ||
    createMutation.isPending ||
    resendMutation.isPending ||
    revokeMutation.isPending ||
    updateRoleMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!inviteForm.email) {
                toast.error("Email is required");
                return;
              }
              createMutation.mutate({
                email: inviteForm.email,
                role: inviteForm.role,
                firstName: inviteForm.firstName || undefined,
                lastName: inviteForm.lastName || undefined,
              });
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="employee@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((s) => ({ ...s, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-first">First name (optional)</Label>
              <Input
                id="invite-first"
                type="text"
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm((s) => ({ ...s, firstName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-last">Last name (optional)</Label>
              <Input
                id="invite-last"
                type="text"
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm((s) => ({ ...s, lastName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm((s) => ({ ...s, role: value as EmployeeRole }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmployeeRole.STAFF}>Staff</SelectItem>
                  <SelectItem value={EmployeeRole.MANAGER}>Manager</SelectItem>
                  <SelectItem value={EmployeeRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-4" />
                    Inviting...
                  </span>
                ) : (
                  "Send invite"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {invitationsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="size-4" />
              Loading invitations...
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending invitations.</div>
          ) : (
            <div className="space-y-3">
              {pendingInvitations.map((inv) => (
                <InvitationRow
                  key={inv.id}
                  invitation={inv}
                  busy={isBusy}
                  onResend={() => resendMutation.mutate(inv.id)}
                  onRevoke={() => revokeMutation.mutate(inv.id)}
                  onUpdateRole={(role) => updateRoleMutation.mutate({ invitationId: inv.id, role })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvitationRow({
  invitation,
  busy,
  onResend,
  onRevoke,
  onUpdateRole,
}: {
  invitation: Invitation;
  busy: boolean;
  onResend: () => void;
  onRevoke: () => void;
  onUpdateRole: (role: EmployeeRole) => void;
}) {
  const [role, setRole] = useState<EmployeeRole>(invitation.role);
  const roleChanged = role !== invitation.role;

  const subtitle = useMemo(() => {
    const expires = formatDate(invitation.expiresAt);
    return expires ? `Expires ${expires}` : "";
  }, [invitation.expiresAt]);

  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-medium truncate">{invitation.email}</div>
          <div className="text-xs text-muted-foreground">
            {invitation.status}
            {subtitle ? ` • ${subtitle}` : ""}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
            <SelectTrigger className="w-full sm:w-[140px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EmployeeRole.STAFF}>Staff</SelectItem>
              <SelectItem value={EmployeeRole.MANAGER}>Manager</SelectItem>
              <SelectItem value={EmployeeRole.ADMIN}>Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy || !roleChanged}
            onClick={() => onUpdateRole(role)}
          >
            Update role
          </Button>

          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onResend}>
            Resend
          </Button>
          <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={onRevoke}>
            Revoke
          </Button>
        </div>
      </div>
    </div>
  );
}
