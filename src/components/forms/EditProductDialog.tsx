import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/useAuth";
import { Product } from "@/types/models";
import { useLanguage } from "@/hooks/useLanguage";

interface EditProductDialogProps {
    product: Product;
    trigger?: React.ReactNode;
}

export function EditProductDialog({ product, trigger }: EditProductDialogProps) {
    const [open, setOpen] = useState(false);
    const shopsRaw = useStore((s) => s.shops);
    const updateProduct = useStore((s) => s.updateProduct);
    const fetchProducts = useStore((s) => s.fetchProducts);
    const { filterShops } = usePermissions();
    const shops = filterShops(shopsRaw);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const [form, setForm] = useState({
        name: product.name,
        category: product.category || "",
        shopId: product.shopId,
        manufacturer: product.manufacturer || "",
        expiryDate: product.expiryDate || "",
        buyingCost: String(product.buyingCost),
        sellingPrice: String(product.sellingPrice),
        quantity: String(product.quantity),
        supplier: product.supplier || "",
        batchNumber: product.batchNumber || "",
        barcode: product.barcode || "",
    });

    useEffect(() => {
        if (open) {
            setForm({
                name: product.name,
                category: product.category || "",
                shopId: product.shopId,
                manufacturer: product.manufacturer || "",
                expiryDate: product.expiryDate || "",
                buyingCost: String(product.buyingCost),
                sellingPrice: String(product.sellingPrice),
                quantity: String(product.quantity),
                supplier: product.supplier || "",
                batchNumber: product.batchNumber || "",
                barcode: product.barcode || "",
            });
        }
    }, [open, product]);

    const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.shopId || !form.buyingCost || !form.sellingPrice || !form.quantity) {
            toast.error(t("please fill all required fields"));
            return;
        }
        setLoading(true);
        try {
            await updateProduct(product.id, {
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
            toast.success(t("success"));
            setOpen(false);
        } catch (err) {
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2 focus:bg-slate-100 rounded-lg cursor-pointer">
                        <Edit className="w-4 h-4" />
                        <span className="font-bold text-xs text-slate-700">{t("edit details")}</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{t("edit details")}: {product.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("product name")} *</Label>
                            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("product name")} maxLength={150} className="bg-secondary/30 h-10 border-none" />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("category")}</Label>
                            <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder={t("e.g. foundation")} maxLength={50} className="bg-secondary/30 h-10 border-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("shop")} *</Label>
                            <Select value={form.shopId} onValueChange={(v) => update("shopId", v)}>
                                <SelectTrigger className="bg-secondary/30 h-10 border-none"><SelectValue placeholder={t("select shop")} /></SelectTrigger>
                                <SelectContent>
                                    {shops.filter((s) => s.status === "active").map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("manufacturer")}</Label>
                            <Input value={form.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} placeholder={t("manufacturer")} maxLength={100} className="bg-secondary/30 h-10 border-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("buying cost")} *</Label>
                            <Input type="number" min="0" step="0.01" value={form.buyingCost} onChange={(e) => update("buyingCost", e.target.value)} placeholder="0.00" className="bg-secondary/30 h-10 border-none" />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("selling price")} *</Label>
                            <Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} placeholder="0.00" className="bg-secondary/30 h-10 border-none" />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("quantity")} *</Label>
                            <Input type="number" min="0" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="0" className="bg-secondary/30 h-10 border-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("supplier")}</Label>
                            <Input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} placeholder={t("supplier")} maxLength={100} className="bg-secondary/30 h-10 border-none" />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("batch number")}</Label>
                            <Input value={form.batchNumber} onChange={(e) => update("batchNumber", e.target.value)} placeholder={t("batch number")} maxLength={50} className="bg-secondary/30 h-10 border-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("expiry date")}</Label>
                            <Input type="date" value={form.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} className="bg-secondary/30 h-10 border-none" />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">{t("barcode")} ({t("optional")})</Label>
                            <Input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} placeholder={t("barcode")} maxLength={50} className="bg-secondary/30 h-10 border-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-11 px-6">{t("cancel")}</Button>
                        <Button type="submit" disabled={loading} className="h-11 px-6 font-bold uppercase tracking-wider">{loading ? t("saving...") : t("save changes")}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
