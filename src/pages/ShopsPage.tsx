import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { Store, MapPin, Package, TrendingUp, Trash2, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddShopDialog } from "@/components/forms/AddShopDialog";
import { EditShopDialog } from "@/components/forms/EditShopDialog";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ShopsPage = () => {
    const { t } = useLanguage();
    const shopsRaw = useStore((s) => s.shops);
    const allShops = Array.isArray(shopsRaw) ? shopsRaw : [];
    const products = useStore((s) => s.products);
    const sales = useStore((s) => s.sales);
    const deleteShop = useStore((s) => s.deleteShop);
    const { can, isAdmin } = usePermissions();
    const [deletingShop, setDeletingShop] = useState<any>(null);

    // The backend already filters shops for non-admins
    const shops = allShops.filter(Boolean);
    const canManage = isAdmin || can("manage_shops");

    return (
        <AppLayout title={t("shops")} subtitle={t("manage your retail locations")}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1" />
                    {canManage && <AddShopDialog />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-24 bg-card rounded-2xl border border-dashed border-border/60">
                            <div className="flex flex-col items-center gap-4">
                                <Store className="w-16 h-16 opacity-10" />
                                <p className="text-lg font-medium opacity-50">{t("no shops match your current search/filters")}</p>
                            </div>
                        </div>
                    ) : (
                        shops.map((shop) => {
                            const shopProducts = products.filter((p) => String(p.shopId) === String(shop.id));
                            const shopSales = sales.filter((s) => String(s.shopId) === String(shop.id));
                            const totalRevenue = shopSales.reduce((sum, s) => sum + s.totalCost, 0);
                            
                            return (
                                <div key={shop.id} className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{shop.name}</h3>
                                            </div>
                                            {shop.location && (
                                                <div className="flex items-center text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg w-fit">
                                                    <MapPin className="w-3 h-3 mr-1 text-primary/70" />
                                                    {shop.location}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider">{t(shop.type)}</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
                                                <Package className="w-3 h-3 mr-1.5" />
                                                {t("products")}
                                            </div>
                                            <p className="text-2xl font-black text-foreground tracking-tighter">{shopProducts.length.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center text-[10px] font-black uppercase text-emerald-600/70 tracking-widest mb-1">
                                                <TrendingUp className="w-3 h-3 mr-1.5" />
                                                {t("total revenue")}
                                            </div>
                                            <p className="text-2xl font-black text-foreground tracking-tighter">
                                                <span className="text-xs font-bold mr-1 text-muted-foreground">Tsh</span>
                                                {totalRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {canManage && (
                                        <div className="flex items-center justify-end gap-2 pt-6 mt-6 border-t border-border/40 relative z-10">
                                            <EditShopDialog shop={shop} />
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-9 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold transition-all" 
                                                onClick={() => setDeletingShop(shop)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {t("delete")}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingShop} onOpenChange={(open) => !open && setDeletingShop(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black italic">{t("are you absolutely sure?")}</AlertDialogTitle>
                        <AlertDialogDescription className="text-base font-medium">
                            {t("this will permanently delete this item.")} {t("all associated products and sales will be removed.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="h-11 rounded-xl font-bold uppercase tracking-wider">{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase tracking-wider shadow-lg shadow-destructive/20"
                            onClick={async () => {
                                if (!deletingShop) return;
                                try {
                                    await deleteShop(deletingShop.id);
                                    toast.success(t("success"));
                                    setDeletingShop(null);
                                } catch (err) {
                                    toast.error(t("failed to delete shop"));
                                }
                            }}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default ShopsPage;

