import { useParams } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, Truck, CheckCircle2, MapPin, CreditCard, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(Number(id), { query: { enabled: !!id, queryKey: getGetOrderQueryKey(Number(id)) } });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-[200px] w-full rounded-2xl" />
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
            <div className="md:col-span-1 space-y-6">
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Order not found</h2>
          <Link href="/orders"><Button className="mt-4">Back to Orders</Button></Link>
        </div>
      </Layout>
    );
  }

  const steps = [
    { id: 'placed', label: 'Order Placed', icon: Clock },
    { id: 'packed', label: 'Packed', icon: Package },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-12">
        <Link href="/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Order #{order.id.toString().padStart(6, '0')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge className="text-sm px-4 py-1 rounded-full uppercase tracking-wider font-semibold">
            {order.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="md:col-span-2 space-y-6">
            
            {/* Tracking Tracker */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-display">Track Order</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <div className="absolute top-5 left-6 right-6 h-0.5 bg-muted"></div>
                  <div 
                    className="absolute top-5 left-6 h-0.5 bg-primary transition-all duration-500" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  ></div>
                  
                  <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                            isCompleted ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20' : 'bg-muted text-muted-foreground border-2 border-background'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs font-semibold uppercase tracking-wider text-center ${
                            isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items List */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-display">Items in Order ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 flex gap-4 items-center">
                      <Link href={`/product/${item.productId}`}>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted/20 border overflow-hidden shrink-0">
                          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.productId}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 mb-1">
                          {item.productName}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {item.unit}
                        </div>
                        <div className="text-sm font-medium mt-1">
                          Qty: {item.quantity} × ₹{item.unitPrice}
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        ₹{item.lineTotal}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-primary/5 border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-display">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {order.deliveryFee === 0 ? <span className="text-primary font-semibold">Free</span> : `₹${order.deliveryFee}`}
                  </span>
                </div>
                
                <div className="h-px bg-primary/10 my-2" />
                
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total Paid</span>
                  <span className="font-display font-bold text-2xl text-primary">₹{order.total}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm bg-background p-3 rounded-lg border mt-4">
                  <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="capitalize font-medium">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-display">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1 text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{order.addressLine}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{order.city}, {order.pincode}</p>
                    <p className="text-sm font-medium mt-2">Ph: {order.customerPhone}</p>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Delivery Notes</p>
                    <p className="text-sm text-foreground italic bg-muted/30 p-3 rounded-lg border-l-2 border-primary">"{order.notes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
