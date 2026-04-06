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
import { AddExpenseDialog } from "@/components/forms/AddExpenseDialog";
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
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("total expenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="text-2xl font-black italic">Tsh{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-rose-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("expense count")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <span className="text-2xl font-black italic">{filteredExpenses.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border/40">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search expenses...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 border-none bg-secondary/50 rounded-xl font-medium"
            />
          </div>
          <AddExpenseDialog />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-bold text-xs uppercase py-4">{t("date")}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t("category")}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t("shop")}</TableHead>
                <TableHead className="font-bold text-xs uppercase">{t("amount")}</TableHead>
                <TableHead className="font-bold text-xs uppercase max-w-[200px]">{t("description")}</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">{t("actions")}</TableHead>
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
                    <TableRow key={expense.id} className="hover:bg-secondary/20 transition-colors border-border/50">
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold uppercase text-[10px]">
                          {t(expense.category.toLowerCase())}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-sm italic">{shop?.name || t("unknown shop")}</TableCell>
                      <TableCell className="font-black text-rose-600 italic">Tsh{expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-medium italic line-clamp-1 max-w-[200px]">{expense.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        {(user?.role === 'admin' || user?.id === expense.userId) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(expense.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
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
