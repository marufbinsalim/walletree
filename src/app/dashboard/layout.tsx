"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "../../components/ui/badge";
import { Bell, Menu, X } from "lucide-react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Organizations", href: "/dashboard/organizations" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const pendingInvites = useQuery(api.invites.getPendingInvitesForUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <div className="bg-background min-h-screen">
          {/* Header */}
          <header className="bg-card shadow-sm border-border border-b">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="mr-4 md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                  <Link
                    href="/dashboard"
                    className="font-bold text-primary text-xl"
                  >
                    Walletree
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  {pendingInvites && pendingInvites.length > 0 && (
                    <div className="relative">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <Badge
                        variant="destructive"
                        className="-top-2 -right-2 absolute flex justify-center items-center p-0 w-5 h-5 text-xs"
                      >
                        {pendingInvites.length}
                      </Badge>
                    </div>
                  )}
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex">
            {/* Sidebar */}
            <nav className={cn(
              "bg-card shadow-sm border-border border-r w-64 min-h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out",
              "md:translate-x-0 md:static md:block",
              sidebarOpen ? "translate-x-0 fixed inset-y-0 left-0 z-50" : "-translate-x-full fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0"
            )}>
              <div className="p-6">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "block px-3 py-2 rounded-md font-medium text-sm transition-colors",
                          pathname === item.href
                            ? "bg-accent text-accent-foreground border-r-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Overlay for mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Main content */}
            <main className="flex-1 p-4 md:p-8">{children}</main>
          </div>
        </div>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
