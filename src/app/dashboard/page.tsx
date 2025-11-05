"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { CreateOrganizationModal } from "../../components/create-organization-modal";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const pendingInvites = useQuery(api.invites.getPendingInvitesForUser);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");

  const acceptInvite = useMutation(api.invites.acceptInvite);
  const declineInvite = useMutation(api.invites.declineInvite);

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptInvite({ inviteId: inviteId as any });
      toast.success("Invite accepted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invite"
      );
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to decline this invite?")) return;

    try {
      await declineInvite({ inviteId: inviteId as any });
      toast.success("Invite declined successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to decline invite"
      );
    }
  };

  // Set the first organization as selected when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganizationId) {
      setSelectedOrganizationId(organizations[0]._id);
    }
  }, [organizations, selectedOrganizationId]);

  const monthlyStats = useQuery(api.transactions.getMonthlyStats, {
    organizationId: selectedOrganizationId
      ? (selectedOrganizationId as any)
      : undefined,
  });

  if (!monthlyStats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border-blue-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-foreground text-3xl">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center py-12 text-center">
          <h2 className="mb-2 font-semibold text-foreground text-xl">
            No Organizations Yet
          </h2>
          <p className="mb-6 text-muted-foreground">
            Create your first organization to start tracking transactions.
          </p>
          <CreateOrganizationModal />
        </div>

        {/* Pending Invites Section */}
        {pendingInvites && pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pending Organization Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10">
                        O
                      </div>
                      <div>
                        <p className="font-medium">Organization Invite</p>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineInvite(invite._id)}
                          className="hover:bg-red-50 border-red-300 text-red-600"
                        >
                          <XCircle className="mr-1 w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-foreground text-3xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="organization-select">Organization:</Label>
        <Select
          value={selectedOrganizationId}
          onValueChange={setSelectedOrganizationId}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {organizations?.map((org) => (
              <SelectItem key={org._id} value={org._id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pending Invites Section */}
      {pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pending Organization Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10">
                      O
                    </div>
                    <div>
                      <p className="font-medium">Organization Invite</p>
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvite(invite._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1 w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineInvite(invite._id)}
                        className="hover:bg-red-50 border-red-300 text-red-600"
                      >
                        <XCircle className="mr-1 w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Spent This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 text-2xl">
              ${monthlyStats.totalSpent.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Earned This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-green-600 text-2xl">
              ${monthlyStats.totalEarned.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                monthlyStats.totalEarned - monthlyStats.totalSpent >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${(monthlyStats.totalEarned - monthlyStats.totalSpent).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Transaction history will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
