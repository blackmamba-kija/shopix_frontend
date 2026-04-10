import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Filter, Box, DollarSign, ArrowUpRight, RefreshCcw, PackagePlus } from "lucide-react";
import { useState } from "react";
import { AddProductDialog } from "@/components/forms/AddProductDialog";
import { usePermissions } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RestockInventoryDialog } from "@/components/forms/RestockInventoryDialog";
import { ImportDialog } from "@/components/forms/ImportDialog";
import { FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, History, Edit, Trash2 } from "lucide-react";
import { EditProductDialog } from "@/components/forms/EditProductDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const InventoryPage = () => {
  const { t } = useLanguage();
  const formatTsh = (v: number) => `Tsh${v.toLocaleString()}`;
  const allProducts = useStore((s) => s.products);
  const allShops = useStore((s) => s.shops);
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "expiring">("all");
  const { can, isAdmin } = usePermissions();
  const deleteProduct = useStore((s) => s.deleteProduct);
  const refreshAllData = useStore((s) => s.refreshAllData);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const [search, setSearch] = useState("");
  const globalShopId = useStore((s) => s.selectedShopId);
  const setSelectedShopId = useStore((s) => s.setSelectedShopId);
  const selectedShop = globalShopId;

  const products = (allProducts || []).filter(p =>
    p && p.shopId &&
    (selectedShop === "all" || String(p.shopId) === String(selectedShop))
  );
  const shops = (allShops || []).filter(s => s && s.id);
  const canManageProducts = isAdmin || can("add_products") || can("edit_products");
  const canDeleteProducts = isAdmin || can("delete_products");

  const filtered = products.filter((p) => {
    if (!p || p.quantity == null) return false;

    let matchesStatus = true;
    if (statusFilter === "low") matchesStatus = p.quantity <= 10;
    else if (statusFilter === "expiring") {
      if (!p.expiryDate) matchesStatus = false;
      else {
        const diff = new Date(p.expiryDate).getTime() - Date.now();
        matchesStatus = diff < 90 * 24 * 60 * 60 * 1000 && diff > 0;
      }
    }

    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalStockValue = filtered.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.buyingCost || 0)), 0);
  const totalPotentialRevenue = filtered.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.sellingPrice || 0)), 0);

  const getShop = (shopId: string) => shops.find((s) => s.id === shopId);

  return (
    <AppLayout title={t("inventory")} subtitle={t("manage your products and track stock levels")}>
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title={t("total items")} value={filtered.length.toString()} icon={Box} change={t("current filtered stock")} changeType="neutral" />
          {isAdmin && (
            <>
              <StatCard title={t("stock cost")} value={formatTsh(totalStockValue)} icon={DollarSign} change={t("investment in stock")} changeType="neutral" />
              <StatCard title={t("est. revenue")} value={formatTsh(totalPotentialRevenue)} icon={ArrowUpRight} change={t("full sale potential")} changeType="positive" />
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-96 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={t("search...")} 
                className="pl-9 h-11 border-border bg-secondary/50 shadow-sm rounded-xl font-bold transition-all focus-visible:ring-primary/20 hover:border-border/80" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              <Select value={selectedShop} onValueChange={setSelectedShopId}>
                <SelectTrigger className="w-full sm:w-52 h-11 rounded-xl border-border bg-secondary/50 shadow-sm font-bold">
                  <SelectValue placeholder={t("all shops")} />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="all">{t("all shops")}</SelectItem>}
                  {shops.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              
              {canManageProducts && (
                <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={refreshAllData}
                      className="h-11 w-11 p-0 rounded-xl border-border bg-secondary/50 shadow-sm hover:bg-secondary transition-all shrink-0"
                      title={t("refresh data")}
                    >
                      <RefreshCcw className="w-4 h-4 text-primary" />
                    </Button>
                    {(isAdmin || can("manage_imports")) && (
                      <ImportDialog 
                        type="inventory" 
                        trigger={
                          <Button variant="outline" className="h-11 rounded-xl shadow-sm gap-2 px-5 border-border hover:bg-secondary transition-all shrink-0 font-bold">
                            <FileSpreadsheet className="w-4 h-4 text-primary" /> {t("import")}
                          </Button>
                        }
                      />
                    )}
                  <AddProductDialog trigger={
                    <Button className="h-11 rounded-xl shadow-md gap-2 px-5 hover:scale-[1.02] transition-transform shrink-0 font-bold">
                      <PackagePlus className="w-4 h-4" /> {t("add product")}
                    </Button>
                  }/>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="py-4 font-bold text-muted-foreground w-[280px]">{t("product name")}</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground">{t("location")}</TableHead>
                {isAdmin && <TableHead className="py-4 font-bold text-muted-foreground text-right">{t("buying cost")}</TableHead>}
                <TableHead className="py-4 font-bold text-muted-foreground text-right">{t("selling price")}</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">{t("quantity")}</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">{t("status")}</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-24">
                    <div className="flex flex-col items-center gap-3">
                      <Filter className="w-12 h-12 opacity-20" />
                      <p className="text-lg font-medium opacity-50">{t("no products match your current search/filters")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => {
                  const shop = getShop(product.shopId);
                  const isLowStock = product.quantity <= 10;
                  const isExpiring = product.expiryDate && new Date(product.expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 && new Date(product.expiryDate).getTime() > Date.now();

                  return (
                    <TableRow key={product.id} className="hover:bg-primary/5 transition-all group">
                      <TableCell className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{product.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit mt-1">{product.batchNumber || t("no-batch")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4"><Badge variant="outline" className="font-semibold px-2 py-0 border-primary/20 bg-primary/5 text-primary">{shop?.name}</Badge></TableCell>
                      {isAdmin && <TableCell className="p-4 text-right text-muted-foreground font-mono">Tsh{product.buyingCost.toLocaleString()}</TableCell>}
                      <TableCell className="p-4 text-right">
                        <span className="font-bold text-lg text-foreground tracking-tight">Tsh{product.sellingPrice.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn("font-black text-lg", isLowStock ? "text-destructive animate-pulse" : "text-foreground")}>{product.quantity}</span>
                          {isLowStock && <span className="text-[9px] font-bold text-destructive uppercase tracking-tighter">{t("low stock")}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        {product.expiryDate ? (
                          <div className={cn("flex items-center justify-center gap-1.5 px-2 py-1 rounded-md w-fit mx-auto", isExpiring ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground")}>
                            {isExpiring ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span className="text-xs font-bold">{product.expiryDate}</span>
                          </div>
                        ) : <span className="text-xs text-muted-foreground font-medium">—</span>}
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <RestockInventoryDialog
                            initialProductId={product.id}
                            trigger={
                              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                                <RefreshCcw className="w-3.5 h-3.5" />
                                <span className="font-bold text-xs">{t("restock")}</span>
                              </Button>
                            }
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary rounded-full">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-md border-border">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2 py-1.5">{t("product actions")}</DropdownMenuLabel>
                              {canManageProducts && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2 focus:bg-secondary focus:text-foreground rounded-lg cursor-pointer" onSelect={() => setEditingProduct(product)}>
                                    <Edit className="w-4 h-4" />
                                    <span className="font-bold text-xs">{t("edit details")}</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                                {canDeleteProducts && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="gap-2 focus:bg-destructive/10 text-destructive rounded-lg cursor-pointer transition-colors" onSelect={() => setDeletingProduct(product)}>
                                      <Trash2 className="w-4 h-4" />
                                      <span className="font-bold text-xs">{t("delete item")}</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}

      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("are you absolutely sure?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("this will permanently delete this item.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingProduct) return;
                try {
                  await deleteProduct(deletingProduct.id);
                  toast.success(t("product deleted successfully"));
                  setDeletingProduct(null);
                } catch (err) {
                  toast.error(t("failed to delete product"));
                }
              }}
            >
              {t("delete product")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default InventoryPage;
