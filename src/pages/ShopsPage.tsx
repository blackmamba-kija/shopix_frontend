import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { Store, MapPin, Package, TrendingUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddShopDialog } from "@/components/forms/AddShopDialog";
import { EditShopDialog } from "@/components/forms/EditShopDialog";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/useAuth";

const ShopsPage = () => {
  const shopsRaw = useStore((s) => s.shops);
  const allShops = Array.isArray(shopsRaw) ? shopsRaw : [];
  const products = useStore((s) => s.products);
  const sales = useStore((s) => s.sales);
  const deleteShop = useStore((s) => s.deleteShop);
  const { can, isAdmin } = usePermissions();
  // The backend already filters shops for non-admins
  const shops = allShops.filter(Boolean);
  const canManage = isAdmin || can("manage_shops");

  return (
    <AppLayout title="Shops" subtitle="Manage your retail locations">
      {canManage && (
        <div className="flex justify-end mb-4">
          <AddShopDialog />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shops.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No shops available. Add a shop to get started.
          </div>
        ) : (
          shops.map((shop) => {
            const shopProducts = products.filter((p) => p.shopId === shop.id);
            const shopSales = sales.filter((s) => s.shopId === shop.id);
            const totalRevenue = shopSales.reduce((sum, s) => sum + s.totalCost, 0);
            return (
              <div key={shop.id} className="bg-card border border-border rounded-xl p-5 animate-slide-up hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{shop.name}</h3>
                      <Badge variant="outline" className="text-xs capitalize text-primary border-primary/30 bg-primary/5">{shop.type}</Badge>
                    </div>
                    {shop.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {shop.location}
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <Package className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs font-medium">Products</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{shopProducts.length}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center text-success/80 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs font-medium">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      Tsh{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
                    <EditShopDialog shop={shop} />
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if (window.confirm("Are you sure you want to delete this shop?")) {
                        deleteShop(shop.id).catch(() => toast.error("Failed to delete shop"));
                      }
                    }}>
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
};

export default ShopsPage;
