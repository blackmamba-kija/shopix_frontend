import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ShoppingCart, Search, Filter, Calendar as CalendarIcon, Plus, FileSpreadsheet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecordSaleDialog } from "@/components/forms/RecordSaleDialog";
import { ImportDialog } from "@/components/forms/ImportDialog";
import { usePermissions } from "@/hooks/useAuth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SalesPage = () => {
  const { t } = useLanguage();
  const allSales = useStore((s) => s.sales);
  const allShops = useStore((s) => s.shops);
  const { can, isAdmin } = usePermissions();

  // Filter states
  const [search, setSearch] = useState("");
  const globalShopId = useStore((s) => s.selectedShopId);
  const setSelectedShopId = useStore((s) => s.setSelectedShopId);
  const selectedShop = globalShopId;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const sales = (allSales || []).filter(s =>
    s && s.shopId &&
    (selectedShop === "all" || String(s.shopId) === String(selectedShop))
  );
  const shops = (allShops || []).filter(s => s && s.id);
  const canRecordSales = isAdmin || can("record_sales");

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

  const filtered = sales.filter((s) => {
    const productName = s.productName || "";
    const matchesSearch = productName.toLowerCase().includes(search.toLowerCase());
    const matchesDateFrom = !dateFrom || s.date >= dateFrom;
    const matchesDateTo = !dateTo || s.date <= dateTo;
    const matchesMinAmount = !minAmount || Number(s.totalCost) >= parseFloat(minAmount);
    const matchesMaxAmount = !maxAmount || Number(s.totalCost) <= parseFloat(maxAmount);
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount;
  });

  const formatTsh = (v: number) => `Tsh${v.toLocaleString()}`;
  const getShop = (shopId: string) => shops.find((s) => s.id === shopId);

  return (
    <AppLayout title={t("sales")} subtitle={t("track daily product sales and transactions")}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isAdmin && (
            <>
              <StatCard title={t("today's revenue")} value={formatTsh(todayRevenue)} icon={DollarSign} change={`${todaySales.length} ${t("sales today")}`} changeType="neutral" />
              <StatCard title={t("today's profit")} value={formatTsh(todayProfit)} icon={TrendingUp} change={t("estimated earnings")} changeType="positive" />
              <StatCard title={t("filtered revenue")} value={formatTsh(filtered.reduce((sum, s) => sum + Number(s.totalCost || 0), 0))} icon={ShoppingCart} change={`${filtered.length} ${t("total transactions")}`} changeType="neutral" />
            </>
          )}
          {!isAdmin && (
            <StatCard title={t("total volume")} value={filtered.length.toString()} icon={ShoppingCart} change={t("total filtered transactions")} changeType="neutral" />
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 bg-card border border-border p-3 rounded-xl w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t("search...")} className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <Select value={selectedShop} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-full sm:w-44 h-9">
                <SelectValue placeholder={t("all shops")} />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="all">{t("all shops")}</SelectItem>}
                {shops.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-36 group cursor-pointer" onClick={() => { (dateFromRef.current as any)?.showPicker?.(); }}>
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors group-hover:text-primary-foreground pointer-events-none" />
                <Input
                  ref={dateFromRef}
                  type="date"
                  className="pl-9 h-9 text-xs cursor-pointer hover:bg-primary/5 transition-colors"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="relative flex-1 sm:w-36 group cursor-pointer" onClick={() => { (dateToRef.current as any)?.showPicker?.(); }}>
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors group-hover:text-primary-foreground pointer-events-none" />
                <Input
                  ref={dateToRef}
                  type="date"
                  className="pl-9 h-9 text-xs cursor-pointer hover:bg-primary/5 transition-colors"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input placeholder={t("min tsh")} type="number" className="w-full sm:w-24 h-9 text-xs" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
              <Input placeholder={t("max tsh")} type="number" className="w-full sm:w-24 h-9 text-xs" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </div>

            {(search || selectedShop !== "all" || dateFrom || dateTo || minAmount || maxAmount) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSelectedShopId("all"); setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount(""); }} className="h-9 px-3">
                {t("clear")}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canRecordSales && (
              <>
                <ImportDialog 
                  type="sales" 
                  trigger={
                    <Button variant="outline" className="h-10 rounded-xl shadow-sm gap-2 px-4 border-border hover:bg-secondary transition-all shrink-0 font-bold">
                      <FileSpreadsheet className="w-4 h-4 text-primary" /> {t("import")}
                    </Button>
                  }
                />
                <RecordSaleDialog trigger={<Button className="gap-2 h-10 px-4 rounded-xl"><Plus className="w-4 h-4" /> {t("record sale")}</Button>} />
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{t("sales records")}</h3>
            <Badge variant="secondary" className="font-mono">{filtered.length} {t("entries")}</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("product")}</TableHead>
                  <TableHead className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("shop")}</TableHead>
                  <TableHead className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("date")}</TableHead>
                  <TableHead className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("qty")}</TableHead>
                  <TableHead className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("price")}</TableHead>
                  <TableHead className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("total")}</TableHead>
                  {isAdmin && <TableHead className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("profit")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground py-20">
                      <div className="flex flex-col items-center gap-3 opacity-60">
                        <Filter className="w-10 h-10" />
                        <p className="text-base font-medium">{t("no sales found matching your criteria")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sale) => {
                    const shop = getShop(sale.shopId);
                    return (
                      <TableRow key={sale.id} className="border-b border-border last:border-0 hover:bg-primary/5 transition-colors group">
                        <TableCell className="p-4 font-semibold text-foreground group-hover:text-primary transition-colors">{sale.productName}</TableCell>
                        <TableCell className="p-4"><Badge variant="outline" className="font-medium bg-background">{shop?.name}</Badge></TableCell>
                        <TableCell className="p-4 text-muted-foreground">
                          <div className="font-medium">{sale.date}</div>
                          <div className="text-[10px] opacity-60 uppercase">{sale.time}</div>
                        </TableCell>
                        <TableCell className="p-4 text-right text-foreground font-medium">{sale.quantity}</TableCell>
                        <TableCell className="p-4 text-right text-muted-foreground font-mono">Tsh{sale.sellingPrice.toLocaleString()}</TableCell>
                        <TableCell className="p-4 text-right font-bold text-foreground text-lg">Tsh{sale.totalCost.toLocaleString()}</TableCell>
                        {isAdmin && (
                          <TableCell className="p-4 text-right">
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-success/10 text-success text-sm font-bold border border-success/20">
                              Tsh{sale.profit.toLocaleString()}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SalesPage;
