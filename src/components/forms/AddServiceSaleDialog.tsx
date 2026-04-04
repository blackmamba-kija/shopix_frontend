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
import { useLanguage } from "@/hooks/useLanguage";

export function AddServiceSaleDialog() {
  const [open, setOpen] = useState(false);
  const shopsRaw = useStore((s) => s.shops);
  const addServiceSale = useStore((s) => s.addServiceSale);
  const fetchServiceSales = useStore((s) => s.fetchServiceSales);
  const { filterShops } = usePermissions();
  const shops = filterShops(shopsRaw);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const [serviceName, setServiceName] = useState("");
  const [shopId, setShopId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !shopId || !quantity || !pricePerUnit) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await addServiceSale({
        serviceName: serviceName.trim(),
        shopId,
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
      });
      await fetchServiceSales();
      toast.success("Service sale recorded");
      setServiceName("");
      setShopId("");
      setQuantity("");
      setPricePerUnit("");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to record service sale");
    } finally {
      setLoading(false);
    }
  };

  const total = quantity && pricePerUnit ? (parseInt(quantity) * parseFloat(pricePerUnit)).toFixed(2) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> {t("add service sale")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("record service sale")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>{t("service name")} *</Label>
            <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g. Color Printing (A4)" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>{t("shop")} *</Label>
            <Select value={shopId} onValueChange={(v) => setShopId(v)}>
              <SelectTrigger><SelectValue placeholder={t("select shop")} /></SelectTrigger>
              <SelectContent>
                {shops.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("quantity")} *</Label>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>{t("price per unit")} *</Label>
              <Input type="number" min="0" step="0.01" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          {total && (
            <div className="bg-secondary rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("total")}</span>
              <span className="text-lg font-bold text-foreground">Tsh{parseFloat(total).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>{t("cancel")}</Button>
            <Button type="submit" disabled={loading}>{loading ? t("recording...") : t("record service")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
