"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function TransactionsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const transactions = useQuery(api.transactions.getUserTransactions, {});
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  const handleDelete = async (transactionId: any) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction({ transactionId });
    }
  };

  if (!transactions) {
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
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">Manage your earnings and expenses.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <Card key={transaction._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{transaction.description}</h3>
                    <Badge variant={transaction.type === "earning" ? "default" : "destructive"}>
                      {transaction.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">
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
                  <span className={`text-xl font-bold ${
                    transaction.type === "earning" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "earning" ? "+" : "-"}${transaction.amount.toFixed(2)}
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
              <p className="text-gray-500">No transactions yet. Add your first transaction to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}