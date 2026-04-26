import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Show, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  useGetMe,
  useUpdateMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SellerProfilePage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useGetMe({
    query: {
      enabled: isLoaded && isSignedIn === true,
      queryKey: getGetMeQueryKey(),
    },
  });
  const updateMe = useUpdateMe();
  const [displayName, setDisplayName] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [phone, setPhone] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (me && !hydrated) {
      setDisplayName(me.displayName);
      setSellerName(me.sellerName);
      setPhone(me.phone);
      setHydrated(true);
    }
  }, [me, hydrated]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMe.mutateAsync({
        data: { displayName, sellerName, phone },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Profile saved" });
      setLocation("/seller");
    } catch (err) {
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  }

  if (isLoading || !me) {
    return (
      <Layout>
        <div className="container max-w-3xl mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Show when="signed-in">
      <Layout>
        <div className="container max-w-3xl mx-auto px-4 md:px-6 py-10">
          <Link href="/seller">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to dashboard
            </Button>
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-2">
            Seller profile
          </h1>
          <p className="text-stone-600 mb-8">
            This information appears on your shop and helps buyers trust you.
          </p>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="sellerName">Shop / farm name</Label>
                  <Input
                    id="sellerName"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="e.g. Sunrise Organic Farm"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Your name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Contact phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateMe.isPending}>
                    {updateMe.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </Show>
  );
}
