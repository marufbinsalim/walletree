"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { CreateTransactionModal } from "../../../components/create-transaction-modal";
import { CreateOrganizationModal } from "../../../components/create-organization-modal";

export default function TransactionsPage() {
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");

  // Set the first organization as selected when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganizationId) {
      setSelectedOrganizationId(organizations[0]._id);
    }
  }, [organizations, selectedOrganizationId]);

  const transactions = useQuery(api.transactions.getUserTransactions, {
    organizationId: selectedOrganizationId
      ? (selectedOrganizationId as any)
      : undefined,
  });
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  const handleDelete = async (transactionId: any) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction({ transactionId });
    }
  };

  if (!organizations || organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-foreground text-3xl">Transactions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your earnings and expenses.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center py-12 text-center">
          <h2 className="mb-2 font-semibold text-foreground text-xl">
            No Organizations Yet
          </h2>
          <p className="mb-6 text-muted-foreground">
            Create your first organization to start adding transactions.
          </p>
          <CreateOrganizationModal />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-foreground text-3xl">Transactions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your earnings and expenses.
          </p>
        </div>
        <CreateTransactionModal
          organizationId={selectedOrganizationId}
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

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <Card
            key={transaction._id}
            className="shadow-sm hover:shadow-md w-full transition-shadow"
          >
            <CardContent className="p-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "earning"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type === "earning" ? (
                      <ArrowUpCircle className="w-5 h-5" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">
                      {transaction.description}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {transaction.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2 py-0 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {transaction.tags.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="px-2 py-0 text-xs"
                        >
                          +{transaction.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-lg font-semibold ${
                      transaction.type === "earning"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "earning" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="p-0 w-8 h-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 w-8 h-8 text-red-600 hover:text-red-700"
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
