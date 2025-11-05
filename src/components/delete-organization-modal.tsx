"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2 } from "lucide-react";

interface DeleteOrganizationModalProps {
  organizationId: any;
  organizationName: string;
  children?: React.ReactNode;
}

export function DeleteOrganizationModal({
  organizationId,
  organizationName,
  children
}: DeleteOrganizationModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const deleteOrganization = useMutation(api.organizations.deleteOrganization);

  const handleDelete = async () => {
    if (confirmationText !== organizationName) return;

    setIsLoading(true);
    try {
      await deleteOrganization({ organizationId });
      setOpen(false);
      setConfirmationText("");
    } catch (error) {
      console.error("Failed to delete organization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmationValid = confirmationText === organizationName;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Organization</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the organization
            and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <p className="text-sm text-gray-600">
              To confirm deletion, please type <strong>{organizationName}</strong> below:
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type "${organizationName}" to confirm`}
              className={confirmationText && !isConfirmationValid ? "border-red-500" : ""}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-red-500">
                Organization name doesn't match. Please type exactly: {organizationName}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !isConfirmationValid}
          >
            {isLoading ? "Deleting..." : "Delete Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}