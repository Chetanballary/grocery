import { useParams } from "wouter";
import { useGetProduct, useGetCart, useAddCartItem, useUpdateCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, Leaf, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import NotFound from "./not-found";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useGetProduct(slug || "", { query: { enabled: !!slug } });
  
  const { data: cart } = useGetCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addCartItem = useAddCartItem();
  const updateCartItem = useUpdateCartItem();

  const [isUpdating, setIsUpdating] = useState(false);

  const cartItem = cart?.items.find((item) => item.productId === product?.id);
  const quantity = cartItem?.quantity || 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-48 mt-4" />
            <div className="pt-8 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return <NotFound />;
  }

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const handleAdd = async () => {
    setIsUpdating(true);
    try {
      await addCartItem.mutateAsync({ data: { productId: product.id, quantity: 1 } });
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      toast({
        title: "Added to cart",
        description: `${product.name} added to your basket.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (newQty: number) => {
    setIsUpdating(true);
    try {
      await updateCartItem.mutateAsync({ productId: product.id, data: { quantity: newQty } });
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 md:p-8 lg:p-12 rounded-3xl shadow-sm border border-border/40">
        
        {/* Images */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/20 border border-border/50">
          {discount > 0 && (
            <Badge className="absolute top-4 left-4 z-10 bg-destructive text-destructive-foreground text-sm py-1 px-3">
              {discount}% OFF
            </Badge>
          )}
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover object-center"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-20">
              <Badge variant="secondary" className="text-lg font-medium px-6 py-2">Out of Stock</Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col h-full">
          <Badge variant="outline" className="w-fit mb-4 text-primary border-primary/20 bg-primary/5">
            {product.category.name}
          </Badge>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground tracking-tight leading-tight mb-2">
            {product.name}
          </h1>
          
          <div className="text-lg text-muted-foreground mb-6">
            Unit: {product.unit}
          </div>
          
          <div className="flex items-end gap-4 mb-8">
            <div className="text-4xl font-display font-bold text-foreground">
              ₹{product.price}
            </div>
            {product.mrp > product.price && (
              <div className="text-xl text-muted-foreground line-through mb-1">
                MRP: ₹{product.mrp}
              </div>
            )}
            <div className="text-sm text-muted-foreground mb-2 ml-2">
              (Inclusive of all taxes)
            </div>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8">
            {quantity > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto bg-white border border-border rounded-full p-1 shadow-sm">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-secondary/20 hover:text-secondary-foreground"
                    onClick={() => handleUpdateQuantity(quantity - 1)}
                    disabled={isUpdating}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : quantity}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-secondary/20 hover:text-secondary-foreground"
                    onClick={() => handleUpdateQuantity(quantity + 1)}
                    disabled={isUpdating || quantity >= product.stock}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-sm font-medium text-primary">
                  {quantity} item(s) in your cart
                </div>
              </div>
            ) : (
              <Button 
                size="lg" 
                className="w-full sm:w-auto rounded-full font-semibold text-lg px-8 shadow-md"
                onClick={handleAdd}
                disabled={isUpdating || product.stock === 0}
              >
                {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                Add to Cart
              </Button>
            )}
          </div>

          <div className="border-t border-border/50 pt-8 mt-auto">
            <h3 className="font-display font-semibold text-xl mb-4">Product Details</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "No description available for this product. Sourced fresh and packed with care."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-accent/30">
              <Truck className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Superfast Delivery</h4>
              <p className="text-xs text-muted-foreground mt-1">To your doorstep</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-accent/30">
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Best Quality</h4>
              <p className="text-xs text-muted-foreground mt-1">100% guaranteed</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-accent/30">
              <Leaf className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Fresh Produce</h4>
              <p className="text-xs text-muted-foreground mt-1">Locally sourced</p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
