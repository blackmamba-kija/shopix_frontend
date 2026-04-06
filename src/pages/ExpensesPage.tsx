import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Calendar, FileText, Wallet } from "lucide-react";
import { toast } from "sonner";
import AddExpenseDialog from "../components/forms/AddExpenseDialog";
import { useLanguage } from "@/hooks/useLanguage";

export default function ExpensesPage() {
  const { expenses, fetchExpenses, removeExpense, shops, selectedShopId, user } = useStore();
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.category.toLowerCase().includes(search.toLowerCase()) || 
                         (e.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesShop = selectedShopId === "all" || String(e.shopId) === String(selectedShopId);
    return matchesSearch && matchesShop;
  });

  const handleDelete = async (id: string) => {
    if (confirm(t("are you sure you want to delete this expense?"))) {
      try {
        await removeExpense(id);
        toast.success(t("expense deleted"));
      } catch (err) {
        toast.error(t("failed to delete expense"));
      }
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout title={t("Expenses")} subtitle={t("Manage daily operational costs")}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-primary/20 shadow-sm bg-card transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t("total expenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <span className="text-2xl font-black italic text-foreground tracking-tight">Tsh{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-rose-200/50 shadow-sm bg-card transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{t("expense count")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl">
                  <FileText className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-2xl font-black italic text-foreground tracking-tight">{filteredExpenses.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl shadow-sm border border-border">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search expenses...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 border-none bg-muted hover:bg-muted/80 transition-colors rounded-xl font-bold text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <AddExpenseDialog />
        </div>

        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-black text-[10px] uppercase py-5 pl-6 tracking-widest text-muted-foreground">{t("date")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t("category")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t("shop")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t("amount")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground max-w-[200px]">{t("description")}</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground pr-6">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium italic">
                    {t("no expenses found")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => {
                  const shop = shops.find(s => String(s.id) === String(expense.shopId));
                  return (
                    <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors border-border group">
                      <TableCell className="font-bold whitespace-nowrap pl-6 text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-black uppercase text-[9px] tracking-widest px-3 py-0.5">
                          {t(expense.category.toLowerCase())}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-sm italic text-foreground/80">{shop?.name || t("unknown shop")}</TableCell>
                      <TableCell className="font-black text-rose-600 italic text-base tracking-tight">Tsh{expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-semibold italic max-w-[200px] truncate">{expense.description || "-"}</TableCell>
                      <TableCell className="text-right pr-6">
                        {(user?.role === 'admin' || user?.id === expense.userId) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(expense.id)}
                            className="text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
