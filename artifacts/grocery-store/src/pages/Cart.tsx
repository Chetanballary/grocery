import { useGetCart } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import CartLineItem from "@/components/CartLineItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ShoppingBag, ArrowRight } from "lucide-react";

const emptyCartImg = "/empty-cart.png";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-8">Your Cart</h1>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="md:col-span-1">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
          <img src={emptyCartImg} alt="Empty Cart" className="w-64 h-64 object-contain mb-8 opacity-90 mix-blend-multiply" />
          <h2 className="text-2xl font-display font-bold mb-3 tracking-tight">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Looks like you haven't added anything yet. Start filling it with fresh groceries!
          </p>
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8 shadow-md">
              Start Shopping
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 tracking-tight">Your Cart</h1>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className="bg-muted/10 rounded-2xl p-2 border border-border/40">
              <div className="flex items-center justify-between p-4 pb-2 border-b border-border/50 mb-2">
                <span className="font-medium text-muted-foreground">Items ({cart.itemCount})</span>
                <span className="font-medium text-muted-foreground">Total</span>
              </div>
              <div className="space-y-1">
                {cart.items.map((item) => (
                  <CartLineItem key={item.productId} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1 sticky top-24">
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                <CardTitle className="font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-medium">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {cart.deliveryFee === 0 ? <span className="text-primary font-semibold">Free</span> : `₹${cart.deliveryFee}`}
                  </span>
                </div>
                
                <div className="h-px bg-border my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-primary">₹{cart.total}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6 px-6">
                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full rounded-full shadow-md text-base">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span>Secure and encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
