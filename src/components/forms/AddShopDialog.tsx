import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";



export function AddShopDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const addShop = useStore((s) => s.addShop);
  const fetchShops = useStore((s) => s.fetchShops);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      toast.error(t("please fill all required fields"));
      return;
    }
    if (!type.trim()) {
      toast.error(t("please specify the shop type"));
      return;
    }
    setLoading(true);
    try {
      await addShop({ name: name.trim(), type: type.trim(), location: location.trim(), status: "active" });
      await fetchShops();
      toast.success(t("shop created successfully"));
      setName("");
      setLocation("");
      setType("");
      setOpen(false);
    } catch (err) {
      toast.error(t("failed to create shop"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl shadow-md gap-2 px-5 font-black hover:scale-[1.02] transition-transform">
          <Plus className="w-5 h-5" /> {t("new shop")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tight">{t("create new shop")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="shop-name" className="font-bold text-xs uppercase text-muted-foreground ml-1">{t("shop name")} *</Label>
            <Input id="shop-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("e.g. city electronics")} maxLength={100} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
          </div>
          <div className="space-y-2 flex flex-col">
            <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">{t("shop type")} *</Label>
            <Input id="shop-type" value={type} onChange={(e) => setType(e.target.value)} placeholder={t("e.g. pharmacy")} maxLength={100} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="shop-location" className="font-bold text-xs uppercase text-muted-foreground ml-1">{t("location")} *</Label>
            <Input id="shop-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("e.g. mall road, block c")} maxLength={200} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider">{t("cancel")}</Button>
            <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-primary/20">{loading ? t("creating...") : t("create shop")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
