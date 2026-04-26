import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCart, usePlaceOrder, getListOrdersQueryKey, getGetCartQueryKey } from "@workspace/api-client-react";
import { PlaceOrderInputPaymentMethod } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import CartLineItem from "@/components/CartLineItem";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Phone number must be valid"),
  addressLine: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  paymentMethod: z.enum(["cod", "upi", "card"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const placeOrder = usePlaceOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      addressLine: "",
      city: "",
      pincode: "",
      paymentMethod: "cod",
      notes: "",
    },
  });

  if (isCartLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-[600px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const order = await placeOrder.mutateAsync({
        data: {
          ...data,
          paymentMethod: data.paymentMethod as PlaceOrderInputPaymentMethod,
        }
      });
      
      // Invalidate cart and orders
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      
      setLocation(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 tracking-tight">Checkout</h1>
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="font-display text-xl">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="checkout-form">
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} className="bg-muted/30 focus-visible:bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" {...field} className="bg-muted/30 focus-visible:bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="addressLine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flat, House no., Building, Company, Apartment</FormLabel>
                          <FormControl>
                            <Input placeholder="123, Rose Apartments..." {...field} className="bg-muted/30 focus-visible:bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Mumbai" {...field} className="bg-muted/30 focus-visible:bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="400001" {...field} className="bg-muted/30 focus-visible:bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific instructions for delivery..." 
                              className="resize-none bg-muted/30 focus-visible:bg-background min-h-[80px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t border-border/50 pt-6 mt-6">
                      <h3 className="font-display font-semibold text-lg mb-4">Payment Method</h3>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0 bg-muted/20 border p-4 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                                  <FormControl>
                                    <RadioGroupItem value="cod" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1">
                                    Cash on Delivery
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 bg-muted/20 border p-4 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                                  <FormControl>
                                    <RadioGroupItem value="upi" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1">
                                    UPI (GPay, PhonePe, Paytm)
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 bg-muted/20 border p-4 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                                  <FormControl>
                                    <RadioGroupItem value="card" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1">
                                    Credit / Debit Card
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-primary/5 border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="h-px bg-primary/10 my-4" />
                
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-lg">Total to Pay</span>
                  <span className="font-display font-bold text-2xl text-primary">₹{cart.total}</span>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form" 
                  size="lg" 
                  className="w-full rounded-full shadow-md text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Place Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">Items in Order</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex gap-3 text-sm border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded object-cover bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity} × ₹{item.product.price}</p>
                    </div>
                    <div className="font-semibold shrink-0">₹{item.lineTotal}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
