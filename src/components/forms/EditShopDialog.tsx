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
import { useLanguage } from "@/hooks/useLanguage";



interface EditShopDialogProps {
    shop: Shop;
}

export function EditShopDialog({ shop }: EditShopDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(shop.name);
    const [type, setType] = useState(shop.type || "");
    const [location, setLocation] = useState(shop.location || "");
    const [logo, setLogo] = useState(shop.logo || "");
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const updateShop = useStore((s) => s.updateShop);
    const fetchShops = useStore((s) => s.fetchShops);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (open) {
            setName(shop.name);
            setType(shop.type || "");
            setLocation(shop.location || "");
            setLogo(shop.logo || "");
        }
    }, [open, shop]);

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
            await updateShop(shop.id, { 
                name: name.trim(), 
                type: type.trim(), 
                location: location.trim(),
                logo: logo.trim()
            });
            await fetchShops();
            toast.success(t("success"));
            setOpen(false);
        } catch (err) {
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            const logoUrl = await (await import("@/api/shops.api")).shopsApi.uploadLogo(shop.id, file);
            setLogo(logoUrl);
            toast.success(t("logo uploaded"));
        } catch (err) {
            toast.error(t("failed to upload logo"));
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-primary hover:text-primary hover:bg-primary/10 rounded-xl font-bold">
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t("edit")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic tracking-tight">{t("edit shop details")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="edit-shop-name" className="font-bold text-xs uppercase text-muted-foreground ml-1">{t("shop name")} *</Label>
                        <Input id="edit-shop-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("e.g. city electronics")} maxLength={100} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">{t("shop type")} *</Label>
                        <Input id="edit-shop-type" value={type} onChange={(e) => setType(e.target.value)} placeholder={t("e.g. pharmacy")} maxLength={100} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="edit-shop-location" className="font-bold text-xs uppercase text-muted-foreground ml-1">{t("location")} *</Label>
                        <Input id="edit-shop-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("e.g. mall road, block c")} maxLength={200} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="edit-shop-logo" className="font-bold text-xs uppercase text-muted-foreground ml-1">
                            {t("shop logo")} {uploadingLogo && "(uploading...)"}
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input 
                                id="edit-shop-logo" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleLogoUpload} 
                                disabled={uploadingLogo} 
                                className="bg-secondary/40 h-12 border-none rounded-xl font-bold text-xs pt-3" 
                            />
                            {logo && (
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-border shadow-sm flex-shrink-0">
                                    <img src={logo.startsWith('http') ? logo : `${window.location.origin.replace(':8080', ':8000')}/${logo}`} className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider">{t("cancel")}</Button>
                        <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-primary/20">{loading ? t("saving...") : t("save changes")}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
