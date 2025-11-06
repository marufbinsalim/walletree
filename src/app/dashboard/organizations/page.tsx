"use client";

import { useState } from "react";
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
import { Plus, Users, Settings, Trash2, CreditCard } from "lucide-react";
import Link from "next/link";
import { CreateOrganizationModal } from "../../../components/create-organization-modal";
import { DeleteOrganizationModal } from "../../../components/delete-organization-modal";
import { ManageMembersModal } from "../../../components/manage-members-modal";

export default function OrganizationsPage() {
  const [selectedOrgForMembers, setSelectedOrgForMembers] = useState<
    string | null
  >(null);
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!organizations) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border-blue-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-foreground text-3xl">Organizations</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your organizations and team members.
          </p>
        </div>
        <CreateOrganizationModal />
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org._id}>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <Badge variant="outline">
                      {org.ownerId === currentUser?._id ? "Owner" : "Member"}
                    </Badge>
                  </div>
                  {org.description && (
                    <p className="mt-1 text-muted-foreground">
                      {org.description}
                    </p>
                  )}
                  <p className="mt-2 text-muted-foreground text-sm">
                    Created {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/dashboard/organizations/${org._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <CreditCard className="mr-2 w-4 h-4" />
                      Transactions
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrgForMembers(org._id)}
                    className="flex-1"
                  >
                    <Users className="mr-2 w-4 h-4" />
                    Members
                  </Button>
                  {org.ownerId === currentUser?._id && (
                    <DeleteOrganizationModal
                      organizationId={org._id}
                      organizationName={org.name}
                    >
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 w-4 h-4" />
                        Delete
                      </Button>
                    </DeleteOrganizationModal>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {organizations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="mb-4 text-muted-foreground">
                No organizations yet.
              </p>
              <CreateOrganizationModal>
                <Button>
                  <Plus className="mr-2 w-4 h-4" />
                  Create Your First Organization
                </Button>
              </CreateOrganizationModal>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedOrgForMembers && (
        <ManageMembersModal
          organizationId={selectedOrgForMembers}
          isOpen={!!selectedOrgForMembers}
          onClose={() => setSelectedOrgForMembers(null)}
        />
      )}
    </div>
  );
}
