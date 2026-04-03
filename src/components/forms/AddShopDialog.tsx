import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";



export function AddShopDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const addShop = useStore((s) => s.addShop);
  const fetchShops = useStore((s) => s.fetchShops);
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!type.trim()) {
      toast.error("Please specify the shop type");
      return;
    }
    setLoading(true);
    try {
      await addShop({ name: name.trim(), type: type.trim(), location: location.trim(), status: "active" });
      await fetchShops();
      toast.success("Shop created successfully");
      setName("");
      setLocation("");
      setType("");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Shop Name *</Label>
            <Input id="shop-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. City Electronics" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Shop Type *</Label>
            <Input id="shop-type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Pharmacy" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-location">Location *</Label>
            <Input id="shop-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mall Road, Block C" maxLength={200} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Shop"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
