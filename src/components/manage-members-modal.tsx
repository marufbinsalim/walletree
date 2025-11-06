"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
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
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedMemberToKick, setSelectedMemberToKick] = useState<string | null>(null);

  const members = useQuery(api.organizations.getOrganizationMembers, {
    organizationId: organizationId as any,
  });
  const invites = useQuery(api.invites.getOrganizationInvites, {
    organizationId: organizationId as any,
  });

  // Check if current user is owner
  const currentUser = useQuery(api.users.getCurrentUser);
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const organization = organizations?.find((org) => org._id === organizationId);
  const isOwner = organization?.ownerId === currentUser?._id;

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



  const handleConfirmKick = async () => {
    if (!selectedMemberToKick) return;

    try {
      await kickMember({
        userId: selectedMemberToKick as any,
        organizationId: organizationId as any,
      });
      toast.success("Member kicked successfully!");
      setIsKickModalOpen(false);
      setSelectedMemberToKick(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to kick member"
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
            <div className={cn("space-y-4", isKickModalOpen && "blur-sm")}>
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
                        member._id === organization?.ownerId
                          ? "default"
                          : "secondary"
                      }
                    >
                      {member._id === organization?.ownerId
                        ? "owner"
                        : "member"}
                    </Badge>
                    {isOwner && member._id !== organization?.ownerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMemberToKick(member._id);
                          setIsKickModalOpen(true);
                        }}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Dialog open={isKickModalOpen} onOpenChange={setIsKickModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Kick Member</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  Are you sure you want to kick this member from the
                  organization?
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsKickModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmKick}>Kick Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                          onClick={() => {
                            setInviteId(invite._id);
                            setIsRevokeModalOpen(true)
                          }}
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

              <Dialog
                open={isRevokeModalOpen}
                onOpenChange={setIsRevokeModalOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Revoke Invite</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    Are you sure you want to revoke this invite?
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsRevokeModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await revokeInvite({ inviteId: inviteId as any });
                        } catch (error) {
                          console.error(error);
                        }
                        finally {
                          setIsRevokeModalOpen(false);  
                        }
                      }}
                    >
                      Revoke Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
