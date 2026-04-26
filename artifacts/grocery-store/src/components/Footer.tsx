import { Link } from "wouter";
import { ShoppingBasket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 py-12">
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <ShoppingBasket className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-primary">
                FreshCart
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your friendly neighborhood online grocery store. Delivering fresh produce, daily essentials, and puja items right to your door with care.
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/category/fruits-vegetables" className="hover:text-primary transition-colors">Fresh Produce</Link></li>
              <li><Link href="/category/dairy-bread" className="hover:text-primary transition-colors">Dairy & Bread</Link></li>
              <li><Link href="/category/puja-items" className="hover:text-primary transition-colors">Puja Needs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Your Cart</Link></li>
              <li><button className="hover:text-primary transition-colors">FAQ</button></li>
              <li><button className="hover:text-primary transition-colors">Contact Us</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Fresh Promise</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We source our products locally to ensure the highest quality and freshness. If you're not satisfied, let us know and we'll make it right.
            </p>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FreshCart Grocery. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">Terms of Service</button>
            <button className="hover:text-primary transition-colors">Privacy Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
