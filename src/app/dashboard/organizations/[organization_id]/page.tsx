"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { CreateTransactionModal } from "../../../../components/create-transaction-modal";
import Link from "next/link";

export default function OrganizationTransactionsPage() {
  const { organization_id } = useParams();
  const organizationId = organization_id as string;

  const organizations = useQuery(api.organizations.getUserOrganizations);
  const organization = organizations?.find((org) => org._id === organizationId);
  const transactions = useQuery(api.transactions.getUserTransactions, {
    organizationId: organizationId as any,
  });
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  const handleDelete = async (transactionId: any) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction({ transactionId });
    }
  };

  if (!organization || !transactions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Organizations
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              {organization.name} Transactions
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage earnings and expenses for this organization.
            </p>
          </div>
        </div>
        <CreateTransactionModal
          organizationId={organizationId}
          onSuccess={() => {
            // The query will automatically refetch when the mutation completes
          }}
        >
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            Add Transaction
          </Button>
        </CreateTransactionModal>
      </div>

      <div className="gap-4 grid">
        {transactions.map((transaction) => (
          <Card key={transaction._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {transaction.description}
                    </h3>
                    <Badge
                      variant={
                        transaction.type === "earning"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {transaction.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xl font-bold ${
                      transaction.type === "earning"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "earning" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(transaction._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {transactions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No transactions yet. Add your first transaction to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
