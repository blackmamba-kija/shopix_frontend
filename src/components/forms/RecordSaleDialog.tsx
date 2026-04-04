import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/store/useStore";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
interface RecordSaleDialogProps {
  trigger?: React.ReactNode;
}

export function RecordSaleDialog({ trigger }: RecordSaleDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [openProductSelect, setOpenProductSelect] = useState(false);

  const shopsRaw = useStore((s) => s.shops);
  const products = useStore((s) => s.products);
  const addSale = useStore((s) => s.addSale);
  const fetchSales = useStore((s) => s.fetchSales);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const fetchShops = useStore((s) => s.fetchShops);

  const { filterShops } = usePermissions();
  const shops = filterShops(shopsRaw);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const [shopId, setShopId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  // Fetch initial data when dialog opens
  useEffect(() => {
    if (open) {
      fetchShops();
      fetchProducts();
    }
  }, [open, fetchShops, fetchProducts]);

  // Robust filtering for products in inventory
  const availableProducts = products.filter((p) => {
    if (!shopId) return false;
    // Handle both shopId and shop_id from backend
    const pShopId = String(p.shopId || (p as any).shop_id || "");
    return pShopId === String(shopId);
  });

  // Handling ID comparison safely
  const selectedProduct = products.find((p) => String(p.id) === String(productId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !productId || !quantity) {
      toast.error(t("please fill all required fields"));
      return;
    }
    const qty = parseInt(quantity);
    if (selectedProduct && qty > selectedProduct.quantity) {
      toast.error(`${t("only")} ${selectedProduct.quantity} ${t("remaining")} ${t("units")} ${t("in inventory")}`);
      return;
    }
    setLoading(true);
    try {
      await addSale({ productId, shopId, quantity: qty });
      await fetchSales();
      toast.success(t("sale recorded successfully"));
      setShopId("");
      setProductId("");
      setQuantity("");
      setOpen(false);
    } catch (err) {
      toast.error(t("failed to record sale"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> {t("record sale")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("record new sale")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">{t("shop")} *</Label>
            <Select value={shopId} onValueChange={(v) => { setShopId(v); setProductId(""); }}>
              <SelectTrigger className="w-full bg-background border-border hover:border-primary/50 transition-colors">
                <SelectValue placeholder={t("select shop")} />
              </SelectTrigger>
              <SelectContent>
                {shops.filter((s) => s.status === "active" || !s.status).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-semibold">{t("product")} *</Label>
            <Popover open={openProductSelect} onOpenChange={setOpenProductSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProductSelect}
                  className={cn(
                    "w-full justify-between font-normal bg-background border-border hover:border-primary/50 transition-colors text-left truncate",
                    !productId && "text-muted-foreground"
                  )}
                  disabled={!shopId}
                >
                  <span className="truncate">
                    {productId
                      ? availableProducts.find((p) => String(p.id) === String(productId))?.name
                      : shopId ? t("select product") : t("select a shop first")}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                <Command>
                  <CommandInput placeholder={t("search...")} className="h-9" />
                  <CommandList>
                    <CommandEmpty>{t("no product found in this shop's inventory.")}</CommandEmpty>
                    <CommandGroup>
                      {availableProducts.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.name}
                          onSelect={() => {
                            setProductId(String(p.id));
                            setOpenProductSelect(false);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium truncate">{p.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Tsh{p.sellingPrice.toLocaleString()} · {p.quantity} {t("in stock")}
                              </span>
                            </div>
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              String(productId) === String(p.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-semibold">{t("quantity")} *</Label>
            <Input
              type="number"
              min="1"
              max={selectedProduct?.quantity || 999}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t("enter quantity")}
              className="bg-background border-border hover:border-primary/50 transition-colors focus-visible:ring-primary/20"
            />
          </div>

          {selectedProduct && quantity && parseInt(quantity) > 0 && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("unit price")}</span>
                <span className="font-medium text-foreground">Tsh{selectedProduct.sellingPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-1 border-t border-primary/10">
                <span className="text-foreground">{t("total")}</span>
                <span className="text-primary">Tsh{(selectedProduct.sellingPrice * parseInt(quantity)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-success-foreground bg-success/10 px-2 py-1 rounded-md">
                <span className="font-medium">{t("est. profit")}</span>
                <span className="font-bold">Tsh{((selectedProduct.sellingPrice - selectedProduct.buyingCost) * parseInt(quantity)).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 rounded-xl h-11 border-border bg-background hover:bg-secondary transition-all"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {loading ? t("recording...") : t("record sale")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
