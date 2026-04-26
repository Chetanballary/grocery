import { Link } from "wouter";
import { useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CartItem } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "./ui/button";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartLineItemProps {
  item: CartItem;
  readonly?: boolean;
}

export default function CartLineItem({ item, readonly = false }: CartLineItemProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const handleUpdate = async (newQty: number) => {
    setIsLoading(true);
    try {
      if (newQty === 0) {
        await removeCartItem.mutateAsync({ productId: item.productId });
      } else {
        await updateCartItem.mutateAsync({ productId: item.productId, data: { quantity: newQty } });
      }
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cart item.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await removeCartItem.mutateAsync({ productId: item.productId });
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      toast({
        title: "Item removed",
        description: `${item.product.name} has been removed from your cart.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove cart item.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b border-border/50 last:border-0 relative bg-white rounded-lg p-4 shadow-sm mb-3">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      
      <Link href={`/product/${item.product.slug}`} className="shrink-0">
        <div className="w-20 h-20 rounded-md bg-muted/20 overflow-hidden border">
          <img 
            src={item.product.imageUrl} 
            alt={item.product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div>
            <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
              {item.product.name}
            </Link>
            <div className="text-sm text-muted-foreground mt-0.5">
              {item.product.unit}
            </div>
          </div>
          <div className="font-semibold text-right whitespace-nowrap">
            ₹{item.lineTotal}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="text-sm">
            <span className="text-muted-foreground mr-1">Price:</span>
            <span className="font-medium">₹{item.product.price}</span>
            {item.product.mrp > item.product.price && (
              <span className="text-muted-foreground line-through ml-2 text-xs">₹{item.product.mrp}</span>
            )}
          </div>
          
          {!readonly ? (
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleRemove}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-full px-2 py-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-secondary/20 hover:text-secondary-foreground"
                  onClick={() => handleUpdate(item.quantity - 1)}
                  disabled={isLoading}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-semibold w-4 text-center">
                  {item.quantity}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-secondary/20 hover:text-secondary-foreground"
                  onClick={() => handleUpdate(item.quantity + 1)}
                  disabled={isLoading || item.quantity >= item.product.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium bg-muted px-2 py-1 rounded">
              Qty: {item.quantity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
