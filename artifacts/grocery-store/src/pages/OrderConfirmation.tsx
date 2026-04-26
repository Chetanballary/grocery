import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChevronRight, Package, Truck, Home } from "lucide-react";
import { format } from "date-fns";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(Number(id), { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 space-y-8 text-center">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-64 w-full rounded-2xl mt-8" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Order not found</h2>
          <Link href="/"><Button className="mt-4">Return Home</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight mb-3">
            Thank you for your order!
          </h1>
          <p className="text-lg text-muted-foreground">
            We've received your order and are getting it ready.
          </p>
        </div>

        <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden mb-8">
          <div className="bg-muted/30 p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-display font-bold text-lg">#{order.id.toString().padStart(6, '0')}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </div>
          
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x border-b border-border/50">
              <div className="p-6 flex items-start gap-4">
                <Home className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.addressLine}</p>
                  <p className="text-sm text-muted-foreground">{order.city}, {order.pincode}</p>
                  <p className="text-sm text-muted-foreground mt-1">Ph: {order.customerPhone}</p>
                </div>
              </div>
              <div className="p-6 flex items-start gap-4">
                <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Order Status</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mt-1">
                    {order.status.replace('_', ' ').toUpperCase()}
                  </div>
                  <p className="font-semibold mt-4 mb-1">Payment Method</p>
                  <p className="text-sm text-muted-foreground capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5">
              <h3 className="font-semibold mb-4 text-primary">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({order.items.length} items)</span>
                  <span className="font-medium">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">{order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
                </div>
                <div className="pt-3 border-t border-primary/10 flex justify-between items-center text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-display font-bold text-xl text-primary">₹{order.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders">
            <Button variant="outline" className="w-full sm:w-auto rounded-full px-8">
              Track Order
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto rounded-full px-8 shadow-sm">
              Continue Shopping <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
