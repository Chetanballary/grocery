import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useSearch } from "wouter";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Filter, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialFeatured = searchParams.get("featured") === "true";
  
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories } = useListCategories();

  const { data: products, isLoading } = useListProducts({ 
    categorySlug: selectedCategory !== "all" ? selectedCategory : undefined,
    search: debouncedSearch || undefined,
    featured: initialFeatured ? true : undefined,
  });

  const sortedProducts = products ? [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    return 0;
  }) : [];

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight">
            {initialFeatured ? "Featured Products" : "All Products"}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === "all" ? "default" : "secondary"} 
              className="cursor-pointer text-sm py-1 px-4 rounded-full"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Badge>
            {categories?.map((cat) => (
              <Badge 
                key={cat.id}
                variant={selectedCategory === cat.slug ? "default" : "secondary"} 
                className="cursor-pointer text-sm py-1 px-4 rounded-full"
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search all products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-[180px] bg-muted/50 border-transparent">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[350px] rounded-xl" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed">
            <div className="bg-muted p-4 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              We couldn't find any products matching your search criteria.
            </p>
            <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
