"use client";

import { SignUp } from '@clerk/nextjs';
import { useTheme } from '@/components/theme-provider';

export default function SignUpPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp
        appearance={{
          baseTheme: theme === 'dark' ? undefined : undefined,
          variables: {
            colorPrimary: theme === 'dark' ? '#3b82f6' : '#2563eb',
          },
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            card: 'shadow-lg bg-card border border-border',
            rootBox: 'w-full',
            cardBox: 'w-full max-w-md',
          },
        }}
      />
    </div>
  );
}