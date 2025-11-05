"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { User, Mail, Calendar } from "lucide-react";

export default function SettingsPage() {
  const user = useQuery(api.users.getCurrentUser);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Name not set"}
                </p>
                <p className="text-sm text-gray-500">Full name</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-gray-500">Email address</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <p className="text-sm text-gray-500">Account role</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {user.organizationId ? (
              <div className="space-y-4">
                <p className="text-gray-600">You are a member of an organization.</p>
                <Button variant="outline">
                  View Organization Settings
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">You are not part of any organization.</p>
                <Button>
                  Create Organization
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}