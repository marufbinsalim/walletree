"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { User, Mail, Calendar } from "lucide-react";

export default function SettingsPage() {
  const user = useQuery(api.users.getCurrentUser);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border-blue-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-foreground text-3xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="gap-6 grid">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Name not set"}
                </p>
                <p className="text-muted-foreground text-sm">Full name</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-muted-foreground text-sm">Email address</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
