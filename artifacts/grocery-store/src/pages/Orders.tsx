import { useListOrders } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Package, ArrowRight, Clock, CheckCircle2, Truck } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto bg-white rounded-3xl border border-border/50 shadow-sm px-6">
          <div className="bg-muted p-6 rounded-full mb-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 tracking-tight">No orders yet</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            When you place orders, they will appear here so you can track their status.
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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'placed': return <Clock className="h-4 w-4" />;
      case 'packed': return <Package className="h-4 w-4" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'placed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 tracking-tight">Your Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <CardContent className="p-0">
                <div className="bg-muted/30 p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Order Number</p>
                      <p className="font-semibold text-foreground">#{order.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div className="h-8 w-px bg-border hidden sm:block"></div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Date</p>
                      <p className="font-medium text-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="h-8 w-px bg-border hidden sm:block"></div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Total</p>
                      <p className="font-bold text-foreground">₹{order.total}</p>
                    </div>
                  </div>
                  
                  <Link href={`/order/${order.id}`}>
                    <Button variant="outline" size="sm" className="rounded-full bg-white group-hover:border-primary/50 group-hover:text-primary transition-colors">
                      View Details <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-3">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative w-16 h-16 rounded-md bg-muted/20 border overflow-hidden" title={item.productName}>
                          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background">
                            {item.quantity}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border font-medium text-muted-foreground text-sm">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
