"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded, userId, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (clerkLoaded && isSignedIn && userId) {
      // Create user in Convex if they don't exist
      createUser({
        clerkId: userId,
        email: user?.primaryEmailAddress?.emailAddress || "",
        firstName: user?.firstName || undefined,
        lastName: user?.lastName || undefined,
        imageUrl: user?.imageUrl || undefined,
      });
    }
  }, [clerkLoaded, isSignedIn, userId, createUser, user]);

  if (!clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}