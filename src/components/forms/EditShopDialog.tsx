import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Shop } from "@/types/models";

const SHOP_TYPES = [
  "Cosmetics",
  "Stationery",
  "Electronics",
  "Clothing & Fashion",
  "Grocery & Food",
  "Pharmacy",
  "Hardware & Tools",
  "Furniture",
  "Books & Media",
  "Toys & Games",
  "Sports & Fitness",
  "Jewelry",
  "Auto Parts",
  "Agriculture",
  "General Store",
  "Other",
];

interface EditShopDialogProps {
    shop: Shop;
}

export function EditShopDialog({ shop }: EditShopDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(shop.name);
    const isKnownType = SHOP_TYPES.includes(shop.type);
    const [type, setType] = useState(isKnownType ? shop.type : "Other");
    const [customType, setCustomType] = useState(isKnownType ? "" : shop.type);
    const [location, setLocation] = useState(shop.location || "");
    const updateShop = useStore((s) => s.updateShop);
    const fetchShops = useStore((s) => s.fetchShops);
    const [loading, setLoading] = useState(false);

    const finalType = type === "Other" ? customType.trim() : type;

    useEffect(() => {
        if (open) {
            setName(shop.name);
            const known = SHOP_TYPES.includes(shop.type);
            setType(known ? shop.type : "Other");
            setCustomType(known ? "" : shop.type);
            setLocation(shop.location || "");
        }
    }, [open, shop]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !location.trim()) {
            toast.error("Please fill all required fields");
            return;
        }
        if (type === "Other" && !customType.trim()) {
            toast.error("Please specify the shop type");
            return;
        }
        setLoading(true);
        try {
            await updateShop(shop.id, { name: name.trim(), type: finalType, location: location.trim() });
            await fetchShops();
            toast.success("Shop updated successfully");
            setOpen(false);
        } catch (err) {
            toast.error("Failed to update shop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Edit Shop Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="edit-shop-name">Shop Name *</Label>
                        <Input id="edit-shop-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. City Electronics" maxLength={100} />
                    </div>
                    <div className="space-y-2">
                        <Label>Shop Type *</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {SHOP_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {type === "Other" && (
                            <Input
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                placeholder="Specify shop type..."
                                maxLength={50}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-shop-location">Location *</Label>
                        <Input id="edit-shop-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mall Road, Block C" maxLength={200} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
