import { Link, useLocation } from "wouter";
import {
  Search,
  ShoppingBasket,
  Menu,
  Package,
  Sprout,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
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
import {
  basePath,
  clearMockUserId,
  getMockUserId,
  setIntendedRole,
} from "@/lib/auth";
import { useClerk, useUser } from "@clerk/react";

export default function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: cart } = useGetCart();
  const { data: categories } = useListCategories();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const mockUserId = getMockUserId();
  const clerkSignedIn = isLoaded && isSignedIn === true;
  const isAuthenticated = clerkSignedIn || !!mockUserId;
  const { data: me } = useGetMe({
    query: {
      enabled: isAuthenticated,
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
  const clerkDisplayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const displayName =
    me?.sellerName ||
    me?.displayName ||
    (clerkSignedIn ? clerkDisplayName : mockUserId ? "Guest Buyer" : "Guest");
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const authLabel = clerkSignedIn
    ? me?.role === "seller"
      ? "Seller account"
      : "Buyer account"
    : "Guest session";

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
                Aaharaam
              </SheetTitle>
            </SheetHeader>
            <div className="py-6 flex flex-col gap-4">
              <Link href="/" className="text-lg font-medium">
                Home
              </Link>
              <Link href="/products" className="text-lg font-medium">
                All Products
              </Link>
              {isAuthenticated && (
                <>
                  {me?.role === "seller" && (
                    <Link href="/seller" className="text-lg font-medium text-secondary">
                      Seller dashboard
                    </Link>
                  )}
                  <Link href="/orders" className="text-lg font-medium">
                    My orders
                  </Link>
                  {!clerkSignedIn && (
                    <Link href="/sign-in" className="text-lg font-medium text-primary">
                      Sign in or create account
                    </Link>
                  )}
                </>
              )}
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={startSellerSignup}
                  className="text-lg font-medium text-left text-secondary"
                >
                  Sell on Aaharaam
                </button>
              )}
              {isAuthenticated && !clerkSignedIn && (
                <Link href="/sign-in" className="text-lg font-medium text-primary">
                  Sign in or create account
                </Link>
              )}
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
            Aaharaam
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
                  Sell on Aaharaam
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
            {isAuthenticated && (
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
            )}

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

            {!isAuthenticated && (
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
            )}

            {isAuthenticated && (
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
                      {displayName}
                  </div>
                  <div className="text-xs text-muted-foreground font-normal">
                      {authLabel}
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
                  {!clerkSignedIn && (
                    <DropdownMenuItem asChild>
                      <Link href="/sign-in">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in or create account
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      clearMockUserId();
                      if (clerkSignedIn) {
                        await signOut({
                          redirectUrl: window.location.origin + (basePath || "/"),
                        });
                        return;
                      }
                      window.location.assign(basePath || "/");
                    }}
                    data-testid="button-signout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
