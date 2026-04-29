import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SignIn, useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { UserIcon, Sprout } from "lucide-react";
import {
  basePath,
  getMockUserId,
  setIntendedRole,
  setMockUserId,
} from "@/lib/auth";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const mockUserId = getMockUserId();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLocation("/onboarding");
    }
  }, [isLoaded, isSignedIn, setLocation]);

  const handleBuyerGuest = () => {
    setIntendedRole("buyer");
    setMockUserId();
    window.location.assign(basePath || "/");
  };

  const handleSellerGuest = () => {
    setIntendedRole("seller");
    setMockUserId();
    window.location.assign(`${basePath}/onboarding`);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex justify-center rounded-3xl border border-stone-200 bg-white/90 p-4 shadow-xl backdrop-blur">
          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            fallbackRedirectUrl={`${basePath}/onboarding`}
          />
        </div>

        <aside className="rounded-3xl border border-stone-200 bg-white/95 p-6 shadow-xl backdrop-blur">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-stone-900">
              Prefer guest mode?
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              You can keep browsing as a guest or jump into seller onboarding
              without creating a full account.
            </p>
          </div>

          {mockUserId ? (
            <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-900">
              Guest session is already active.
            </div>
          ) : null}

          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 rounded-xl border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              onClick={handleBuyerGuest}
            >
              <UserIcon className="mr-2 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-stone-800">
                Continue as Buyer
              </span>
            </Button>

            <Button
              size="lg"
              className="w-full h-14 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all group"
              onClick={handleSellerGuest}
            >
              <Sprout className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Start as Seller</span>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-medium text-green-700">
              Back to home
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
