import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Show, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBasket, Sprout, Loader2 } from "lucide-react";
import {
  useGetMe,
  useUpdateMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { consumeIntendedRole } from "@/lib/auth";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetMe({
    query: {
      enabled: isLoaded && isSignedIn === true,
      queryKey: getGetMeQueryKey(),
    },
  });
  const { mutateAsync: updateMe, isPending } = useUpdateMe();
  const [busy, setBusy] = useState(false);
  const [intentApplied, setIntentApplied] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLocation("/sign-in");
      return;
    }
  }, [isLoaded, isSignedIn, setLocation]);

  useEffect(() => {
    if (!profile || intentApplied) return;
    const intended = consumeIntendedRole();
    setIntentApplied(true);
    (async () => {
      if (intended && profile.role !== intended) {
        setBusy(true);
        await updateMe({ data: { role: intended } });
        await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setBusy(false);
        setLocation(intended === "seller" ? "/seller" : "/");
        return;
      }
      // No intent stored — if user already has a non-buyer role from a prior visit, send them there
      if (profile.role === "seller") {
        setLocation("/seller");
      }
      // otherwise, show the role picker UI below
    })();
  }, [profile, intentApplied, updateMe, queryClient, setLocation]);

  async function pickRole(role: "buyer" | "seller") {
    setBusy(true);
    await updateMe({ data: { role } });
    await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    setBusy(false);
    setLocation(role === "seller" ? "/seller" : "/");
  }

  return (
    <Show when="signed-in">
      <div className="min-h-[100dvh] bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          {profileLoading || busy || isPending ? (
            <div className="flex flex-col items-center gap-3 text-stone-600">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Setting up your account…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-3">
                  Welcome to FreshCart
                </h1>
                <p className="text-stone-600 text-lg">
                  How would you like to use FreshCart today?
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className="cursor-pointer border-2 hover:border-primary transition-colors group"
                  onClick={() => pickRole("buyer")}
                  data-testid="role-buyer"
                >
                  <CardContent className="p-8 text-center">
                    <div className="bg-primary/10 text-primary rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ShoppingBasket className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                      I'm a Buyer
                    </h2>
                    <p className="text-stone-600 mb-6">
                      Shop fresh fruits, vegetables, dairy, and household
                      essentials delivered to your door.
                    </p>
                    <Button className="w-full" size="lg">
                      Continue as Buyer
                    </Button>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer border-2 hover:border-secondary transition-colors group"
                  onClick={() => pickRole("seller")}
                  data-testid="role-seller"
                >
                  <CardContent className="p-8 text-center">
                    <div className="bg-secondary/10 text-secondary rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                      <Sprout className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                      I'm a Farmer / Trader
                    </h2>
                    <p className="text-stone-600 mb-6">
                      List your produce or goods on FreshCart and sell directly
                      to customers in your area.
                    </p>
                    <Button
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      size="lg"
                    >
                      Continue as Seller
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Show>
  );
}
