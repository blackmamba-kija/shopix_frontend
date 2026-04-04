import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/useStore";
import { RefreshCcw, Search, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface RestockInventoryDialogProps {
    initialProductId?: string;
    trigger?: React.ReactNode;
}

export function RestockInventoryDialog({ initialProductId, trigger }: RestockInventoryDialogProps) {
    const [open, setOpen] = useState(false);
    const products = useStore((s) => s.products);
    const fetchProducts = useStore((s) => s.fetchProducts);
    const shops = useStore((s) => s.shops);
    const { canAccessShop } = usePermissions();
    const { t } = useLanguage();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(initialProductId || "");
    const [action, setAction] = useState<"add" | "remove" | "set">("add");
    const [restockQuantity, setRestockQuantity] = useState("");
    const [loading, setLoading] = useState(false);

    // Additional fields for restocking if prices or batch change
    const [newBuyingCost, setNewBuyingCost] = useState("");
    const [newSellingPrice, setNewSellingPrice] = useState("");
    const [newBatchNumber, setNewBatchNumber] = useState("");
    const [newExpiryDate, setNewExpiryDate] = useState("");

    // Sync with initialProductId if it changes or dialog opens
    useEffect(() => {
        if (initialProductId && open) {
            handleProductSelect(initialProductId);
        }
    }, [initialProductId, open]);

    const filteredProducts = products.filter(p =>
        canAccessShop(p.shopId) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.batchNumber && p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())))
    ).slice(0, 10);

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handleProductSelect = (id: string) => {
        const p = products.find(prod => prod.id === id);
        if (p) {
            setSelectedProductId(id);
            setNewBuyingCost(p.buyingCost.toString());
            setNewSellingPrice(p.sellingPrice.toString());
            setNewBatchNumber(p.batchNumber || "");
            setNewExpiryDate(p.expiryDate || "");
        }
    };

    const handleRestock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !restockQuantity || parseInt(restockQuantity) <= 0) {
            toast.error(t("please fill all required fields"));
            return;
        }

        setLoading(true);
        let newQuantity = selectedProduct!.quantity;
        const inputQty = parseInt(restockQuantity);
        if (action === "add") newQuantity += inputQty;
        else if (action === "remove") newQuantity = Math.max(0, newQuantity - inputQty);
        else if (action === "set") newQuantity = inputQty;

        try {
            const { productsApi } = await import("@/api/products.api");

            const updatedData = {
                quantity: newQuantity,
                buyingCost: newBuyingCost ? parseFloat(newBuyingCost) : selectedProduct!.buyingCost,
                sellingPrice: newSellingPrice ? parseFloat(newSellingPrice) : selectedProduct!.sellingPrice,
                batchNumber: newBatchNumber || selectedProduct!.batchNumber,
                expiryDate: newExpiryDate || selectedProduct!.expiryDate,
            };

            await productsApi.update(selectedProductId, updatedData);
            await fetchProducts();

            toast.success(t("success"));
            resetForm();
            setOpen(false);
        } catch (err) {
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        if (!initialProductId) {
            setSearchTerm("");
            setSelectedProductId("");
        }
        setRestockQuantity("");
        setNewBuyingCost("");
        setNewSellingPrice("");
        setNewBatchNumber("");
        setNewExpiryDate("");
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 hover:bg-primary/5 text-primary">
                        <RefreshCcw className="w-4 h-4" /> {t("adjust stock")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card text-foreground">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
                            <PackagePlus className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">{t("adjust inventory")}</DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{t("add, remove, or set exact stock levels")}</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleRestock} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold">{t("product to restock")}</Label>
                        {!selectedProductId ? (
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder={t("type product name or batch number...")}
                                    className="pl-9 h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-xl text-foreground font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {searchTerm.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="w-full text-left p-3 hover:bg-secondary transition-colors flex items-center justify-between border-b border-border/50 last:border-none"
                                                    onClick={() => handleProductSelect(p.id)}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{p.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-mono uppercase text-muted-foreground">{p.batchNumber || t("no batch")}</span>
                                                            <span className="text-[10px] text-muted-foreground">•</span>
                                                            <span className="text-[10px] text-muted-foreground font-medium">{t("shop")}: {shops.find(s => s.id === p.shopId)?.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-primary uppercase tracking-widest">{p.quantity} {t("in stock")}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-muted-foreground">{t("no matching products found")}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-background border-2 border-border rounded-2xl flex items-center justify-between animate-in zoom-in duration-300 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border">
                                        <RefreshCcw className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground">{selectedProduct?.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold bg-secondary w-fit px-1.5 border border-border rounded mt-0.5 uppercase tracking-tighter">{selectedProduct?.batchNumber}</p>
                                    </div>
                                </div>
                                {!initialProductId && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary text-foreground"
                                        onClick={() => { setSelectedProductId(""); resetForm(); }}
                                    >
                                        {t("change")}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedProductId && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("action type")}</Label>
                                    <div className="flex bg-secondary p-1 rounded-xl h-11">
                                        <button type="button" onClick={() => setAction("add")} className={`flex-1 text-xs font-bold rounded-lg transition-colors ${action === "add" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("add action")}</button>
                                        <button type="button" onClick={() => setAction("remove")} className={`flex-1 text-xs font-bold rounded-lg transition-colors ${action === "remove" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("remove action")}</button>
                                        <button type="button" onClick={() => setAction("set")} className={`flex-1 text-xs font-bold rounded-lg transition-colors ${action === "set" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("set action")}</button>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("quantity")}</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={restockQuantity}
                                        onChange={(e) => setRestockQuantity(e.target.value)}
                                        placeholder={t("e.g. 50")}
                                        className="h-11 border-border focus:ring-2 focus:ring-primary/20 rounded-xl font-black text-lg bg-background text-foreground"
                                    />
                                    <p className="text-[10px] font-bold text-muted-foreground ml-1">{t("total after")}: {action === "set" ? parseInt(restockQuantity) || 0 : (selectedProduct?.quantity || 0) + (action === "add" ? (parseInt(restockQuantity) || 0) : -(parseInt(restockQuantity) || 0))} {t("units")}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("new batch number")}</Label>
                                    <Input
                                        value={newBatchNumber}
                                        onChange={(e) => setNewBatchNumber(e.target.value)}
                                        placeholder={t("batch number")}
                                        className="h-11 border-border focus:ring-2 focus:ring-primary/20 rounded-xl font-bold bg-background text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="bg-secondary/50 p-4 rounded-2xl space-y-4 border border-border/50 shadow-inner">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{t("financial updates (optional)")}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-tighter">{t("buying cost")} (Tsh)</Label>
                                        <Input
                                            type="number"
                                            value={newBuyingCost}
                                            onChange={(e) => setNewBuyingCost(e.target.value)}
                                            className="h-10 bg-background border-border font-bold text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-tighter">{t("selling price")} (Tsh)</Label>
                                        <Input
                                            type="number"
                                            value={newSellingPrice}
                                            onChange={(e) => setNewSellingPrice(e.target.value)}
                                            className="h-10 bg-background border-border font-bold text-foreground"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-tighter">{t("new expiry date")}</Label>
                                    <Input
                                        type="date"
                                        value={newExpiryDate}
                                        onChange={(e) => setNewExpiryDate(e.target.value)}
                                        className="h-10 bg-background border-border font-bold text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="ghost" className="flex-1 rounded-xl h-11 border border-border" onClick={() => setOpen(false)} disabled={loading}>{t("cancel")}</Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-2 h-11 rounded-xl bg-primary text-primary-foreground group relative overflow-hidden transition-all hover:pr-8"
                                >
                                    <span className="relative z-10">{loading ? t("updating...") : t("confirm update")}</span>
                                    {!loading && <PackagePlus className="w-4 h-4 absolute right-[-20px] group-hover:right-3 transition-all opacity-0 group-hover:opacity-100" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
