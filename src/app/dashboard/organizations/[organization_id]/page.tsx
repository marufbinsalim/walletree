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
import { DeleteTransactionModal } from "../../../../components/delete-transaction-modal";
import { EditTransactionModal } from "../../../../components/edit-transaction-modal";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OrganizationTransactionsPage() {
  const { organization_id } = useParams();
  const organizationId = organization_id as string;

  const organizations = useQuery(api.organizations.getUserOrganizations);
  const organization = organizations?.find((org) => org._id === organizationId);
  const transactions = useQuery(api.transactions.getUserTransactions, {
    organizationId: organization ? (organizationId as any) : undefined,
  });
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  if (!organizations) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-foreground text-3xl">
              Organization Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This organization may have been deleted or you may not have access
              to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!transactions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Organizations
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-foreground text-2xl sm:text-3xl">
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
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 w-4 h-4" />
            Add Transaction
          </Button>
        </CreateTransactionModal>
      </div>

      <div className="gap-4 grid">
        {transactions.map((transaction) => (
          <Card
            key={transaction._id}
            className="hover:shadow-md border-l-4 border-l-primary/20 transition-shadow"
          >
            <CardContent className="p-2">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {transaction.description}
                    </h3>
                    <Badge
                      variant={
                        transaction.type === "earning"
                          ? "default"
                          : "destructive"
                      }
                      className="px-1.5 py-0.5 text-xs"
                    >
                      {transaction.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    {transaction.tags.length > 0 && (
                      <div className="flex gap-1">
                        {transaction.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-1.5 py-0 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {transaction.tags.length > 2 && (
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-xs"
                          >
                            +{transaction.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span
                    className={`text-sm font-bold ${
                      transaction.type === "earning"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "earning" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-0.5">
                    <EditTransactionModal transactionId={transaction._id}>
                      <Button variant="ghost" size="sm" className="p-0 w-6 h-6">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </EditTransactionModal>
                    <DeleteTransactionModal
                      transactionId={transaction._id}
                      transactionDescription={transaction.description}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-50 p-0 w-6 h-6 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DeleteTransactionModal>
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
