"use client";

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from "convex/react";
import "./globals.css";
import { ConvexProviderWithClerk } from 'convex/react-clerk';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
              {children}
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
