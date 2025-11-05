"use client";

import { SignIn } from "@clerk/nextjs";
import { useTheme } from "@/components/theme-provider"; // your shadcn theme provider
import { dark} from "@clerk/themes"; // Clerk’s built-in themes

export default function SignInPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        key={theme} // 👈 Forces re-render when theme changes
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          variables: {
            colorPrimary: theme === "dark" ? "#3b82f6" : "#2563eb", // Tailwind blue-500/600
            colorText: theme === "dark" ? "#fff" : "#000",
            borderRadius: "0.5rem",
          },
          elements: {
            // Customize Clerk component parts using Tailwind classes
            rootBox: "w-full flex justify-center",
            card: "shadow-lg bg-card border border-border w-full max-w-md rounded-xl",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            headerTitle: "text-2xl font-semibold text-foreground",
            headerSubtitle: "text-muted-foreground",
          },
        }}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
