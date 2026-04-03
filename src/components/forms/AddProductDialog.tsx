import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/useAuth";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const shopsRaw = useStore((s) => s.shops);
  const addProduct = useStore((s) => s.addProduct);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const { filterShops } = usePermissions();
  const shops = filterShops(shopsRaw);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", category: "", shopId: "", manufacturer: "",
    expiryDate: "", buyingCost: "", sellingPrice: "",
    quantity: "", supplier: "", batchNumber: "", barcode: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shopId || !form.buyingCost || !form.sellingPrice || !form.quantity) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await addProduct({
        name: form.name.trim(),
        category: form.category.trim(),
        shopId: form.shopId,
        manufacturer: form.manufacturer.trim(),
        expiryDate: form.expiryDate || undefined,
        buyingCost: parseFloat(form.buyingCost),
        sellingPrice: parseFloat(form.sellingPrice),
        quantity: parseInt(form.quantity),
        supplier: form.supplier.trim(),
        batchNumber: form.batchNumber.trim(),
        barcode: form.barcode.trim() || undefined,
      });
      await fetchProducts();
      toast.success("Product added successfully");
      setForm({ name: "", category: "", shopId: "", manufacturer: "", expiryDate: "", buyingCost: "", sellingPrice: "", quantity: "", supplier: "", batchNumber: "", barcode: "" });
      setOpen(false);
    } catch (err) {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Product name" maxLength={150} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Foundation" maxLength={50} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Shop *</Label>
              <Select value={form.shopId} onValueChange={(v) => update("shopId", v)}>
                <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                <SelectContent>
                  {shops.filter((s) => s.status === "active").map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Manufacturer</Label>
              <Input value={form.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} placeholder="Manufacturer" maxLength={100} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Buying Cost *</Label>
              <Input type="number" min="0" step="0.01" value={form.buyingCost} onChange={(e) => update("buyingCost", e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Selling Price *</Label>
              <Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity *</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} placeholder="Supplier name" maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Batch Number</Label>
              <Input value={form.batchNumber} onChange={(e) => update("batchNumber", e.target.value)} placeholder="Batch #" maxLength={50} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Barcode (optional)</Label>
              <Input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} placeholder="Barcode" maxLength={50} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
