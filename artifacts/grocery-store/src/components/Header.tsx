import { Link, useLocation } from "wouter";
import {
  Search,
  ShoppingBasket,
  Menu,
  Package,
  Sprout,
  LogIn,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { Show, useUser, useClerk } from "@clerk/react";
import {
  useGetCart,
  useListCategories,
  useGetMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { setIntendedRole } from "@/lib/auth";

export default function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: cart } = useGetCart();
  const { data: categories } = useListCategories();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { data: me } = useGetMe({
    query: {
      enabled: isLoaded && isSignedIn === true,
      queryKey: getGetMeQueryKey(),
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const itemCount = cart?.itemCount || 0;
  const initial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ??
    "U";

  function startSellerSignup() {
    setIntendedRole("seller");
    setLocation("/sign-up");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6 lg:px-8 gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-left font-display text-primary text-xl">
                FreshCart
              </SheetTitle>
            </SheetHeader>
            <div className="py-6 flex flex-col gap-4">
              <Link href="/" className="text-lg font-medium">
                Home
              </Link>
              <Link href="/products" className="text-lg font-medium">
                All Products
              </Link>
              <Show when="signed-in">
                {me?.role === "seller" && (
                  <Link href="/seller" className="text-lg font-medium text-secondary">
                    Seller dashboard
                  </Link>
                )}
                <Link href="/orders" className="text-lg font-medium">
                  My orders
                </Link>
              </Show>
              <Show when="signed-out">
                <button
                  type="button"
                  onClick={startSellerSignup}
                  className="text-lg font-medium text-left text-secondary"
                >
                  Sell on FreshCart
                </button>
              </Show>
              <div className="h-px bg-border my-2" />
              <h3 className="font-semibold text-muted-foreground uppercase tracking-wider text-sm">
                Categories
              </h3>
              <div className="flex flex-col gap-3">
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="text-base text-foreground/80 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <ShoppingBasket className="h-6 w-6" />
          </div>
          <span className="hidden md:inline-block font-display font-bold text-xl tracking-tight text-primary">
            FreshCart
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-center lg:justify-start">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent font-medium">
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {categories?.map((category) => (
                      <li key={category.id}>
                        <Link href={`/category/${category.slug}`}>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                            <div className="text-sm font-medium leading-none">
                              {category.name}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/products"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  All Products
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  type="button"
                  onClick={startSellerSignup}
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                  data-testid="link-sell-on-freshcart"
                >
                  <Sprout className="h-4 w-4 mr-1.5" />
                  Sell on FreshCart
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          <form
            onSubmit={handleSearch}
            className="flex-1 md:w-64 md:flex-none max-w-sm relative"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groceries..."
              className="w-full bg-muted/50 border-transparent focus-visible:bg-background pl-9 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <nav className="flex items-center gap-1">
            <Show when="signed-in">
              <Link href="/orders">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Orders</span>
                </Button>
              </Link>
            </Show>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                data-testid="button-cart"
              >
                <ShoppingBasket className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-secondary text-secondary-foreground border-2 border-background">
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            <Show when="signed-out">
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-1"
                  data-testid="button-signin"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              </Link>
            </Show>

            <Show when="signed-in">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full ml-1"
                    data-testid="button-account"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {initial}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">
                      {me?.sellerName ||
                        me?.displayName ||
                        user?.firstName ||
                        "Hello"}
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {me?.role === "seller" ? "Seller account" : "Buyer account"}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {me?.role === "seller" && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Seller dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <Package className="h-4 w-4 mr-2" />
                      My orders
                    </Link>
                  </DropdownMenuItem>
                  {me?.role === "buyer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/onboarding">
                        <Sprout className="h-4 w-4 mr-2" />
                        Become a seller
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ redirectUrl: window.location.origin + (import.meta.env.BASE_URL || "/") })}
                    data-testid="button-signout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Show>
          </nav>
        </div>
      </div>
    </header>
  );
}
