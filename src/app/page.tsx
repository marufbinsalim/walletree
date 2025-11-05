import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                Walletree
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
