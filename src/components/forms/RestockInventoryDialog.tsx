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

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(initialProductId || "");
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
            toast.error("Please select a product and enter a valid quantity");
            return;
        }

        setLoading(true);
        try {
            const { productsApi } = await import("@/api/products.api");

            const updatedData = {
                quantity: selectedProduct!.quantity + parseInt(restockQuantity),
                buyingCost: newBuyingCost ? parseFloat(newBuyingCost) : selectedProduct!.buyingCost,
                sellingPrice: newSellingPrice ? parseFloat(newSellingPrice) : selectedProduct!.sellingPrice,
                batchNumber: newBatchNumber || selectedProduct!.batchNumber,
                expiryDate: newExpiryDate || selectedProduct!.expiryDate,
            };

            await productsApi.update(selectedProductId, updatedData);
            await fetchProducts();

            toast.success(`Successfully restocked ${selectedProduct?.name}`);
            resetForm();
            setOpen(false);
        } catch (err) {
            toast.error("Failed to restock inventory");
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
                        <RefreshCcw className="w-4 h-4" /> Restock Items
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                            <PackagePlus className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Restock Inventory</DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Increase stock levels for existing products</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleRestock} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold">Product to Restock</Label>
                        {!selectedProductId ? (
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Type product name or batch number..."
                                    className="pl-9 h-11 bg-white border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-950/10 transition-all rounded-xl text-slate-900 font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {searchTerm.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
                                                    onClick={() => handleProductSelect(p.id)}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{p.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono uppercase text-slate-500">{p.batchNumber || "No Batch"}</span>
                                                            <span className="text-[10px] text-slate-400">•</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">Shop: {shops.find(s => s.id === p.shopId)?.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-primary uppercase tracking-widest">{p.quantity} In Stock</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-muted-foreground">No matching products found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                        <RefreshCcw className="w-5 h-5 text-slate-900" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{selectedProduct?.name}</p>
                                        <p className="text-[10px] text-slate-600 font-bold bg-slate-100 w-fit px-1.5 border border-slate-200 rounded mt-0.5 uppercase tracking-tighter">{selectedProduct?.batchNumber}</p>
                                    </div>
                                </div>
                                {!initialProductId && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-white"
                                        onClick={() => { setSelectedProductId(""); resetForm(); }}
                                    >
                                        Change
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedProductId && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900">Adding Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={restockQuantity}
                                        onChange={(e) => setRestockQuantity(e.target.value)}
                                        placeholder="e.g. 50"
                                        className="h-11 border-slate-300 focus:ring-2 focus:ring-slate-950/20 rounded-xl font-black text-lg bg-white text-slate-900"
                                    />
                                    <p className="text-[10px] font-bold text-slate-600 ml-1">Total after: {(selectedProduct?.quantity || 0) + (parseInt(restockQuantity) || 0)} units</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900">New Batch Number</Label>
                                    <Input
                                        value={newBatchNumber}
                                        onChange={(e) => setNewBatchNumber(e.target.value)}
                                        placeholder="Batch #"
                                        className="h-11 border-slate-300 focus:ring-2 focus:ring-slate-950/20 rounded-xl font-bold bg-white text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-100 p-4 rounded-2xl space-y-4 border border-slate-200 shadow-inner">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Financial Updates (Optional)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-black text-slate-700 uppercase tracking-tighter">Buying Cost (Tsh)</Label>
                                        <Input
                                            type="number"
                                            value={newBuyingCost}
                                            onChange={(e) => setNewBuyingCost(e.target.value)}
                                            className="h-10 bg-white border-slate-300 font-bold text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-black text-slate-700 uppercase tracking-tighter">Selling Price (Tsh)</Label>
                                        <Input
                                            type="number"
                                            value={newSellingPrice}
                                            onChange={(e) => setNewSellingPrice(e.target.value)}
                                            className="h-10 bg-white border-slate-300 font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-tighter">New Expiry Date</Label>
                                    <Input
                                        type="date"
                                        value={newExpiryDate}
                                        onChange={(e) => setNewExpiryDate(e.target.value)}
                                        className="h-10 bg-white border-slate-300 font-bold text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="ghost" className="flex-1 rounded-xl h-11" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-2 h-11 rounded-xl bg-slate-900 group relative overflow-hidden transition-all hover:pr-8"
                                >
                                    <span className="relative z-10">{loading ? "Updating..." : "Confirm Restock"}</span>
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
