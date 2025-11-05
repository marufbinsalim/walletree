import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Walletree - Take Control of Your Financial Future",
  description: "Track expenses, monitor earnings, and make smarter financial decisions with Walletree's beautiful, intuitive tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
