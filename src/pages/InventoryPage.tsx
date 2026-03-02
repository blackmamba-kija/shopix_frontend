import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Filter, Box, DollarSign, ArrowUpRight, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { AddProductDialog } from "@/components/forms/AddProductDialog";
import { usePermissions } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RestockInventoryDialog } from "@/components/forms/RestockInventoryDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, History, Edit, Trash2 } from "lucide-react";

const InventoryPage = () => {
  const formatTsh = (v: number) => `Tsh${v.toLocaleString()}`;
  const allProducts = useStore((s) => s.products);
  const allShops = useStore((s) => s.shops);
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "expiring" | "pending">("all");
  const { can, isAdmin, canAccessShop } = usePermissions();

  // New filter states
  const [search, setSearch] = useState("");
  // Sync with global filter
  const globalShopId = useStore((s) => s.selectedShopId);
  const setSelectedShopId = useStore((s) => s.setSelectedShopId);
  const selectedShop = globalShopId;

  const products = (allProducts || []).filter(p =>
    p && p.shopId &&
    (selectedShop === "all" || String(p.shopId) === String(selectedShop))
  );
  const shops = (allShops || []).filter(s => s && s.id);
  const canAddProducts = isAdmin || can("add_products");

  const filtered = products.filter((p) => {
    if (!p || p.quantity == null) return false;

    // Status filters
    let matchesStatus = true;
    if (statusFilter === "low") matchesStatus = p.quantity <= 10;
    else if (statusFilter === "expiring") {
      if (!p.expiryDate) matchesStatus = false;
      else {
        const diff = new Date(p.expiryDate).getTime() - Date.now();
        matchesStatus = diff < 90 * 24 * 60 * 60 * 1000 && diff > 0;
      }
    }
    else if (statusFilter === "pending") matchesStatus = p.status === "pending";

    // Text & Shop filters
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalStockValue = filtered.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.buyingCost || 0)), 0);
  const totalPotentialRevenue = filtered.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.sellingPrice || 0)), 0);

  const getShop = (shopId: string) => shops.find((s) => s.id === shopId);

  return (
    <AppLayout title="Inventory" subtitle="Manage stock and product catalog">
      <div className="flex flex-col gap-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Items" value={filtered.length.toString()} icon={Box} change="Current filtered stock" changeType="neutral" />
          <StatCard title="Stock Cost" value={formatTsh(totalStockValue)} icon={DollarSign} change="Investment in stock" changeType="neutral" />
          <StatCard title="Est. Revenue" value={formatTsh(totalPotentialRevenue)} icon={ArrowUpRight} change="Full sale potential" changeType="positive" />
        </div>

        <div className="flex flex-col gap-4">
          {/* Status Tabs & Action */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {([
                { key: "all" as const, label: "All Items", count: products.length },
                { key: "low" as const, label: "Low Stock", count: products.filter(p => p.quantity <= 10).length },
                { key: "expiring" as const, label: "Expiring", count: products.filter(p => p.expiryDate && new Date(p.expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 && new Date(p.expiryDate).getTime() - Date.now() > 0).length },
                { key: "pending" as const, label: "Pending", count: products.filter(p => p.status === "pending").length },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                    statusFilter === tab.key
                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  {tab.label} <span className="opacity-60 ml-1">{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {canAddProducts && <RestockInventoryDialog />}
              {canAddProducts && <AddProductDialog />}
            </div>
          </div>

          {/* New Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search name, batch number..." className="pl-9 h-9 border-none bg-primary/5 focus:bg-background transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <Select value={selectedShop} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-full sm:w-52 h-9 border-none bg-primary/5">
                <SelectValue placeholder="All Shops" />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="all">All Shops</SelectItem>}
                {shops.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {(search || selectedShop !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSelectedShopId("all"); }} className="h-9 px-3 text-muted-foreground hover:text-foreground">
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Information</th>
                  <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Location</th>
                  <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Buying Cost</th>
                  <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Selling Price</th>
                  <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Stock Level</th>
                  <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Expiry</th>
                  <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-foreground py-24">
                      <div className="flex flex-col items-center gap-3">
                        <Filter className="w-12 h-12 opacity-20" />
                        <p className="text-lg font-medium opacity-50">No products match your current search/filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const shop = getShop(product.shopId);
                    const isLowStock = product.quantity <= 10;
                    const isExpiring = product.expiryDate && new Date(product.expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 && new Date(product.expiryDate).getTime() > Date.now();

                    return (
                      <tr key={product.id} className="hover:bg-primary/5 transition-all group">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{product.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit mt-1">{product.batchNumber || "NO-BATCH"}</span>
                          </div>
                        </td>
                        <td className="p-4"><Badge variant="outline" className="font-semibold px-2 py-0 border-primary/20 bg-primary/5 text-primary">{shop?.name}</Badge></td>
                        <td className="p-4 text-right text-muted-foreground font-mono">Tsh{product.buyingCost.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-lg text-foreground tracking-tight">Tsh{product.sellingPrice.toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={cn("font-black text-lg", isLowStock ? "text-destructive animate-pulse" : "text-foreground")}>{product.quantity}</span>
                            {isLowStock && <span className="text-[9px] font-bold text-destructive uppercase tracking-tighter">Low Stock</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          {product.expiryDate ? (
                            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md w-fit", isExpiring ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground")}>
                              {isExpiring ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span className="text-xs font-bold">{product.expiryDate}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground font-medium">—</span>}
                        </td>
                        <td className="p-4">
                          <Badge className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            product.status === "approved" && "bg-success/10 text-success border-success/30",
                            product.status === "pending" && "bg-warning/10 text-warning border-warning/30",
                            product.status === "rejected" && "bg-destructive/10 text-destructive border-destructive/30"
                          )} variant="outline">
                            {product.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white rounded-full">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-2xl border-slate-200">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 py-1.5">Product Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <RestockInventoryDialog
                                initialProductId={product.id}
                                trigger={
                                  <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-primary/5 text-primary rounded-lg cursor-pointer transition-colors">
                                    <RefreshCcw className="w-4 h-4" />
                                    <span className="font-bold text-xs uppercase tracking-tight">Quick Restock</span>
                                  </div>
                                }
                              />
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 focus:bg-slate-50 focus:text-slate-900 rounded-lg cursor-pointer">
                                <History className="w-4 h-4" />
                                <span className="font-bold text-xs text-slate-700">Stock History</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 focus:bg-slate-100 rounded-lg cursor-pointer">
                                <Edit className="w-4 h-4" />
                                <span className="font-bold text-xs text-slate-700">Edit Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 focus:bg-destructive/5 focus:text-destructive rounded-lg cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold text-xs text-destructive">Delete Item</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InventoryPage;
