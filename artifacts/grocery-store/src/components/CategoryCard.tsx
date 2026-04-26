import { Link } from "wouter";
import { CategoryWithCount } from "@workspace/api-client-react";
import { Card, CardContent } from "./ui/card";

interface CategoryCardProps {
  category: CategoryWithCount;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-transparent bg-muted/30 hover:bg-white hover:border-primary/20 cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col items-center text-center gap-3">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-sm ring-4 ring-background group-hover:ring-primary/10 transition-all"
            style={{ backgroundColor: category.accentColor || 'var(--primary)' }}
          >
            <img 
              src={category.imageUrl} 
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {category.productCount} items
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
