"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Trash2,
  UserPlus,
  UserMinus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ManageMembersModalProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageMembersModal({
  organizationId,
  isOpen,
  onClose,
}: ManageMembersModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");

  const members = useQuery(api.organizations.getOrganizationMembers, {
    organizationId: organizationId as any,
  });
  const invites = useQuery(api.invites.getOrganizationInvites, {
    organizationId: organizationId as any,
  });

  // Check if current user is owner
  const currentUser = useQuery(api.users.getCurrentUser);
  const isOwner = members?.some(
    (member) => member._id === currentUser?._id && member.role === "owner"
  );

  const createInvite = useMutation(api.invites.createInvite);
  const revokeInvite = useMutation(api.invites.revokeInvite);
  const kickMember = useMutation(api.invites.kickMember);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await createInvite({
        organizationId: organizationId as any,
        email: inviteEmail,
        role: inviteRole,
      });
      toast.success("Invite sent successfully!");
      setInviteEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invite"
      );
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to revoke this invite?")) return;

    try {
      await revokeInvite({ inviteId: inviteId as any });
      toast.success("Invite revoked successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke invite"
      );
    }
  };

  const handleKickMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await kickMember({
        userId: userId as any,
        organizationId: organizationId as any,
      });
      toast.success("Member removed successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member"
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "declined":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "revoked":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "revoked":
        return <Badge variant="outline">Revoked</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="members" className="w-full">
          <TabsList
            className={`grid w-full ${isOwner ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <TabsTrigger value="members">
              Members ({members?.length || 0})
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="invites">
                Invites ({invites?.length || 0})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="space-y-4">
              {members?.map((member) => (
                <div
                  key={member._id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10">
                      {member.firstName?.[0] || member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.email}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        member.role === "owner" ? "default" : "secondary"
                      }
                    >
                      {member.role}
                    </Badge>
                    {isOwner && member.role !== "owner" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleKickMember(member._id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {isOwner && (
            <TabsContent value="invites" className="space-y-4">
              {/* Send New Invite Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium">Send New Invite</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value: "owner" | "member") =>
                        setInviteRole(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSendInvite}>
                      <UserPlus className="mr-2 w-4 h-4" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing Invites */}
              <div className="space-y-4">
                <h3 className="font-medium">Existing Invites</h3>
                {invites?.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10">
                        {invite.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-muted-foreground text-sm">
                          Invited{" "}
                          {new Date(invite.invitedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          invite.role === "owner" ? "default" : "secondary"
                        }
                      >
                        {invite.role}
                      </Badge>
                      {getStatusBadge(invite.status)}
                      {invite.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeInvite(invite._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {(!invites || invites.length === 0) && (
                  <div className="py-8 text-muted-foreground text-center">
                    No invites sent yet
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
