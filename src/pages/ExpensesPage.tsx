import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, Calendar, FileText, Wallet, Edit2 } from "lucide-react";
import { toast } from "sonner";
import AddExpenseDialog from "../components/forms/AddExpenseDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { usePermissions } from "@/hooks/useAuth";
import { Expense } from "@/types/models";
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

export default function ExpensesPage() {
  const { expenses, fetchExpenses, removeExpense, shops, selectedShopId, user } = useStore();
  const [search, setSearch] = useState("");
  const { t } = useLanguage();
  const { isAdmin, can } = usePermissions();

  // Edit state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", category: "", description: "", date: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const canEdit = isAdmin || can("edit_expenses");
  const canDelete = isAdmin || can("delete_expenses");

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesShop = selectedShopId === "all" || String(e.shopId) === String(selectedShopId);
    return matchesSearch && matchesShop;
  });

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditForm({
      amount: String(expense.amount),
      category: expense.category,
      description: expense.description || "",
      date: expense.date,
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setEditLoading(true);
    try {
      const { expensesApi } = await import("@/api/expenses.api");
      const updated = await expensesApi.update(editingExpense.id, {
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        description: editForm.description,
        date: editForm.date,
      });
      // Update local store
      useStore.setState((s) => ({
        expenses: s.expenses.map((ex) => (ex.id === updated.id ? updated : ex)),
      }));
      toast.success(t("expense updated"));
      setEditingExpense(null);
    } catch {
      toast.error(t("failed to update expense"));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;
    try {
      await removeExpense(deletingExpense.id);
      toast.success(t("expense deleted"));
      setDeletingExpense(null);
    } catch {
      toast.error(t("failed to delete expense"));
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout title={t("Expenses")} subtitle={t("Manage daily operational costs")}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-primary/20 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t("total expenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl"><Wallet className="w-5 h-5 text-primary" /></div>
                <span className="text-2xl font-black italic text-foreground tracking-tight">Tsh{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-rose-200/50 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{t("expense count")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl"><FileText className="w-5 h-5 text-rose-500" /></div>
                <span className="text-2xl font-black italic text-foreground tracking-tight">{filteredExpenses.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl shadow-sm border border-border">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search expenses...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 border-none bg-muted rounded-xl font-bold"
            />
          </div>
          <AddExpenseDialog />
        </div>

        {/* Table */}
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/80 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-black text-[10px] uppercase py-5 pl-6 tracking-widest text-foreground">{t("date")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground">{t("category")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground">{t("shop")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground">{t("amount")}</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground max-w-[200px]">{t("description")}</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-foreground pr-6">{t("actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit || canDelete ? 6 : 5} className="text-center py-16 text-muted-foreground font-medium italic">
                    {t("no expenses found")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => {
                  const shop = shops.find((s) => String(s.id) === String(expense.shopId));
                  const isOwner = user?.id === expense.userId;
                  return (
                    <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors border-border group">
                      <TableCell className="font-bold whitespace-nowrap pl-6 text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 font-black uppercase text-[9px] tracking-widest px-3 py-0.5">
                          {t(expense.category.toLowerCase())}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-sm italic text-foreground">{shop?.name || t("unknown shop")}</TableCell>
                      <TableCell className="font-black text-rose-500 italic text-base tracking-tight">Tsh{expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-foreground text-xs font-medium italic max-w-[200px] truncate">{expense.description || "—"}</TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {(isAdmin || (canEdit && isOwner)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(expense)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            {(isAdmin || (canDelete && isOwner)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingExpense(expense)}
                                className="h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(v) => !v && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border/40">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic tracking-tight flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" /> {t("edit expense")}
              </DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleEditSave} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("category")}</Label>
                <Input value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("amount")} (Tsh)</Label>
                <Input type="number" min="0" step="0.01" value={editForm.amount} onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("date")}</Label>
              <Input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("description")}</Label>
              <Input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingExpense(null)} className="flex-1 h-11 rounded-xl font-bold uppercase">{t("cancel")}</Button>
              <Button type="submit" disabled={editLoading} className="flex-1 h-11 rounded-xl font-black uppercase shadow-lg shadow-primary/20">
                {editLoading ? t("saving...") : t("save changes")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingExpense} onOpenChange={(v) => !v && setDeletingExpense(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black italic">{t("delete expense?")}</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">{t("this action cannot be undone.")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="h-11 rounded-xl font-bold uppercase">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase shadow-lg shadow-destructive/20"
              onClick={handleDelete}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
