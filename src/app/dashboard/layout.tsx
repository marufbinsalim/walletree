"use client";

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { ConvexProviderWithClerk } from 'convex/react-clerk';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Transactions", href: "/dashboard/transactions" },
  { name: "Organizations", href: "/dashboard/organizations" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                    Walletree
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
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
            <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r">
              <div className="p-6">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}