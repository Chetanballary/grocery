import { useGetHomeShowcase } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Sparkles, TrendingUp, Tags } from "lucide-react";

const heroMarketImg = "/hero-market.png";

export default function Home() {
  const { data: showcase, isLoading } = useGetHomeShowcase();

  if (isLoading || !showcase) {
    return (
      <Layout>
        <div className="space-y-12 pb-12">
          <Skeleton className="w-full h-[400px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="w-48 h-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="w-48 h-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-16 pb-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-primary/5">
          <div className="absolute inset-0">
            <img 
              src={heroMarketImg} 
              alt="Fresh grocery market" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent"></div>
          </div>
          <div className="relative z-10 px-6 py-16 md:py-24 lg:py-32 max-w-2xl flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Fresh arrivals daily</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight tracking-tight">
              Fresh groceries, <br/>
              <span className="text-primary">delivered to you.</span>
            </h1>
            <p className="text-lg text-foreground/80 font-medium">
              Your neighborhood market experience, online. Quality produce, daily essentials, and fresh dairy.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="rounded-full shadow-lg font-semibold px-8 hover:scale-105 transition-transform">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold tracking-tight">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {showcase.categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {showcase.featured.length > 0 && (
          <section className="space-y-6 bg-secondary/5 rounded-3xl p-6 md:p-8 border border-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary p-2 rounded-lg text-secondary-foreground shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-display font-bold tracking-tight">Featured Picks</h2>
              </div>
              <Link href="/products?featured=true">
                <Button variant="ghost" className="text-primary hover:text-primary/80 group">
                  View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {showcase.featured.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Top Deals */}
        {showcase.topDeals.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-destructive p-2 rounded-lg text-destructive-foreground shadow-sm">
                  <Tags className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-display font-bold tracking-tight">Top Deals Today</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {showcase.topDeals.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {showcase.bestSellers.length > 0 && (
          <section className="space-y-6 bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-display font-bold tracking-tight">Neighborhood Favorites</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {showcase.bestSellers.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
