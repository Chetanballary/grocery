import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Show, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Sprout,
  IndianRupee,
} from "lucide-react";
import {
  useGetMe,
  useListCategories,
  useListSellerProducts,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
  getListSellerProductsQueryKey,
  getListProductsQueryKey,
  getGetHomeShowcaseQueryKey,
  getGetMeQueryKey,
  type Product,
} from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  name: string;
  description: string;
  imageUrl: string;
  unit: string;
  price: string;
  mrp: string;
  stock: string;
  categoryId: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  imageUrl: "",
  unit: "",
  price: "",
  mrp: "",
  stock: "",
  categoryId: "",
};

export default function SellerDashboardPage() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me, isLoading: meLoading } = useGetMe({
    query: {
      enabled: isLoaded && isSignedIn === true,
      queryKey: getGetMeQueryKey(),
    },
  });
  const { data: categories } = useListCategories();
  const { data: products, isLoading: productsLoading } = useListSellerProducts({
    query: {
      enabled: me?.role === "seller",
      queryKey: getListSellerProductsQueryKey(),
    },
  });
  const createProduct = useCreateSellerProduct();
  const updateProduct = useUpdateSellerProduct();
  const deleteProduct = useDeleteSellerProduct();

  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLocation("/sign-in");
      return;
    }
  }, [isLoaded, isSignedIn, setLocation]);

  useEffect(() => {
    if (me && me.role !== "seller") {
      setLocation("/onboarding");
    }
  }, [me, setLocation]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      unit: p.unit,
      price: String(p.price),
      mrp: String(p.mrp),
      stock: String(p.stock),
      categoryId: String(p.category.id),
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    const stock = Number(form.stock);
    const categoryId = Number(form.categoryId);
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.imageUrl.trim() ||
      !form.unit.trim() ||
      Number.isNaN(price) ||
      Number.isNaN(mrp) ||
      Number.isNaN(stock) ||
      !categoryId
    ) {
      toast({
        title: "Please fill in all fields",
        description: "Make sure prices and stock are valid numbers.",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      unit: form.unit.trim(),
      price,
      mrp,
      stock,
      categoryId,
    };
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, data: payload });
        toast({ title: "Product updated" });
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast({ title: "Product listed" });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getListSellerProductsQueryKey(),
        }),
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: getGetHomeShowcaseQueryKey(),
        }),
      ]);
      setOpen(false);
    } catch (err) {
      toast({
        title: "Could not save product",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  }

  async function doDelete() {
    if (!confirmDelete) return;
    try {
      await deleteProduct.mutateAsync({ id: confirmDelete.id });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getListSellerProductsQueryKey(),
        }),
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: getGetHomeShowcaseQueryKey(),
        }),
      ]);
      toast({ title: "Product removed" });
      setConfirmDelete(null);
    } catch (err) {
      toast({
        title: "Could not remove product",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  }

  if (meLoading || !me) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Show when="signed-in">
      <Layout>
        <div className="container max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium mb-2">
                <Sprout className="h-4 w-4" />
                Seller dashboard
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
                {me.sellerName || me.displayName || "Your shop"}
              </h1>
              <p className="text-stone-600 mt-1">
                Manage the products you're selling on FreshCart.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/seller/profile">
                <Button variant="outline" size="lg">
                  Edit profile
                </Button>
              </Link>
              <Button onClick={openCreate} size="lg" data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                Add product
              </Button>
            </div>
          </div>

          {productsLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="bg-stone-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-stone-500" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  No products yet
                </h3>
                <p className="text-stone-600 mb-6 max-w-md mx-auto">
                  List your first product so buyers can find it. Add a clear
                  photo, price, and stock count.
                </p>
                <Button onClick={openCreate} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((p) => (
                <Card key={p.id} data-testid={`seller-product-${p.id}`}>
                  <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                          {p.category.name}
                        </span>
                        {p.stock === 0 ? (
                          <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            Out of stock
                          </span>
                        ) : p.stock < 10 ? (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Low stock
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-display font-semibold text-lg text-stone-900 truncate">
                        {p.name}
                      </h3>
                      <p className="text-sm text-stone-600 line-clamp-2 mb-2">
                        {p.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                        <span className="font-semibold text-stone-900 inline-flex items-center">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {Number(p.price).toFixed(0)}
                          <span className="text-stone-500 font-normal ml-1">
                            / {p.unit}
                          </span>
                        </span>
                        {Number(p.mrp) > Number(p.price) && (
                          <span className="text-stone-500 line-through inline-flex items-center">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {Number(p.mrp).toFixed(0)}
                          </span>
                        )}
                        <span className="text-stone-600">
                          Stock: <strong>{p.stock}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 md:justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(p)}
                        data-testid={`button-edit-${p.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDelete(p)}
                        data-testid={`button-delete-${p.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit product" : "List a new product"}
              </DialogTitle>
              <DialogDescription>
                Buyers will see exactly what you enter here. Use a clear name,
                a real photo URL, and accurate stock.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Organic Basmati Rice"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the product, its quality, origin, etc."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Pick category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) =>
                      setForm({ ...form, unit: e.target.value })
                    }
                    placeholder="e.g. 1 kg, 500 g, 1 L"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    type="number"
                    min="0"
                    step="1"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editing ? "Save changes" : "Publish product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!confirmDelete}
          onOpenChange={(o) => !o && setConfirmDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove this product?</DialogTitle>
              <DialogDescription>
                Buyers will no longer see "{confirmDelete?.name}" in the store.
                This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={doDelete}
                disabled={deleteProduct.isPending}
              >
                {deleteProduct.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Remove product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </Show>
  );
}
