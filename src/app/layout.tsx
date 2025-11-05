"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import "./globals.css";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "../components/auth-provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ThemeProvider defaultTheme="dark">
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
              <AuthProvider>{children}</AuthProvider>
            </ConvexProviderWithClerk>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
