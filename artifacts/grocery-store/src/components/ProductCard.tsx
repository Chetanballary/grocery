import { useState } from "react";
import { useAddCartItem, useUpdateCartItem, useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "wouter";
import { Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: cart } = useGetCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addCartItem = useAddCartItem();
  const updateCartItem = useUpdateCartItem();

  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const [isLoading, setIsLoading] = useState(false);

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (e: React.MouseEvent, newQty: number) => {
    e.preventDefault();
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-white">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative aspect-square overflow-hidden bg-muted/20">
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground">
                {discount}% OFF
              </Badge>
            )}
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                <Badge variant="secondary" className="text-sm font-medium px-3 py-1">Out of Stock</Badge>
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-1 gap-2">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {product.category?.name}
            </div>
            <h3 className="font-medium text-foreground line-clamp-2 leading-tight flex-1">
              {product.name}
            </h3>
            
            <div className="text-sm text-muted-foreground mt-auto">
              {product.unit}
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
              <div className="flex flex-col">
                <span className="font-display font-semibold text-lg text-foreground">
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
              
              <div onClick={(e) => e.preventDefault()}>
                {quantity > 0 ? (
                  <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-full px-2 py-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-secondary/20 hover:text-secondary-foreground"
                      onClick={(e) => handleUpdateQuantity(e, quantity - 1)}
                      disabled={isLoading}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold w-4 text-center">
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : quantity}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-secondary/20 hover:text-secondary-foreground"
                      onClick={(e) => handleUpdateQuantity(e, quantity + 1)}
                      disabled={isLoading || quantity >= product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="rounded-full shadow-sm hover:shadow"
                    onClick={handleAdd}
                    disabled={isLoading || product.stock === 0}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
