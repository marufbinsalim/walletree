"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Plus, Users, Settings } from "lucide-react";

export default function OrganizationsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const createOrganization = useMutation(api.organizations.createOrganization);

  const handleCreateOrganization = async () => {
    const name = prompt("Enter organization name:");
    if (name) {
      await createOrganization({ name });
    }
  };

  if (!organizations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-2">Manage your organizations and team members.</p>
        </div>
        <Button onClick={handleCreateOrganization}>
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>

      <div className="grid gap-4">
        {organizations.map((org) => (
          <Card key={org._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <Badge variant="outline">Owner</Badge>
                  </div>
                  {org.description && (
                    <p className="text-gray-600 mt-1">{org.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Created {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {organizations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No organizations yet.</p>
              <Button onClick={handleCreateOrganization}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Organization
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}