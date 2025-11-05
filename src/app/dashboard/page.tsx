"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { CreateOrganizationModal } from "../../components/create-organization-modal";

export default function DashboardPage() {
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");

  // Set the first organization as selected when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganizationId) {
      setSelectedOrganizationId(organizations[0]._id);
    }
  }, [organizations, selectedOrganizationId]);

  const monthlyStats = useQuery(api.transactions.getMonthlyStats, {
    organizationId: selectedOrganizationId ? selectedOrganizationId as any : undefined
  });

  if (!monthlyStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your financial overview.</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Organizations Yet</h2>
          <p className="text-muted-foreground mb-6">Create your first organization to start tracking transactions.</p>
          <CreateOrganizationModal />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your financial overview.</p>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="organization-select">Organization:</Label>
        <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${monthlyStats.totalSpent.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${monthlyStats.totalEarned.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              monthlyStats.totalEarned - monthlyStats.totalSpent >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}>
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
          <p className="text-muted-foreground">Transaction history will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}