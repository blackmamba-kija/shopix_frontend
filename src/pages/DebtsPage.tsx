import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { debtsApi, Debt } from "@/api/debts.api";
import { Wallet, Search, Plus, Calendar, User, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export default function DebtsPage() {
    const { t } = useLanguage();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { isAdmin, can, filterShops } = usePermissions();
    const shopsRaw = useStore((s) => s.shops);
    const products = useStore((s) => s.products);
    const shops = filterShops(shopsRaw);
    const { formatTsh } = useLanguage();

    const canManageDebts = isAdmin || can("manage_debts");

    // Add dialog
    const [openAdd, setOpenAdd] = useState(false);
    const [form, setForm] = useState({
        customer_name: "", phone: "", shop_id: shops[0]?.id || "", product_id: "none",
        quantity: "1", total_amount: "", initial_payment: "", due_date: ""
    });

    // Edit dialog
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [editForm, setEditForm] = useState({ customer_name: "", phone: "", total_amount: "", due_date: "" });
    const [editLoading, setEditLoading] = useState(false);

    // Delete dialog
    const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

    const fetchDebts = async () => {
        setLoading(true);
        try {
            const data = await debtsApi.getAll();
            setDebts(data);
        } catch { toast.error(t("error")); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDebts(); }, []);

    const handleAddDebt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_name || !form.shop_id || !form.total_amount) {
            toast.error(t("please fill all required fields"));
            return;
        }
        try {
            await debtsApi.create({ ...form, product_id: form.product_id === "none" ? null : form.product_id });
            toast.success(t("success"));
            setOpenAdd(false);
            fetchDebts();
        } catch { toast.error(t("error")); }
    };

    const handlePay = async (id: string, amount: string) => {
        if (!amount || parseFloat(amount) <= 0) return;
        try {
            await debtsApi.pay(id, parseFloat(amount));
            toast.success(t("success"));
            fetchDebts();
        } catch { toast.error(t("error")); }
    };

    const handleOpenEdit = (debt: Debt) => {
        setEditingDebt(debt);
        setEditForm({
            customer_name: debt.customerName,
            phone: debt.phone || "",
            total_amount: String(debt.totalAmount),
            due_date: debt.dueDate || "",
        });
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDebt) return;
        setEditLoading(true);
        try {
            await debtsApi.update(editingDebt.id, {
                customerName: editForm.customer_name,
                phone: editForm.phone,
                totalAmount: parseFloat(editForm.total_amount),
                dueDate: editForm.due_date || undefined,
            } as any);
            toast.success(t("success"));
            setEditingDebt(null);
            fetchDebts();
        } catch { toast.error(t("error")); }
        finally { setEditLoading(false); }
    };

    const handleDelete = async () => {
        if (!deletingDebt) return;
        try {
            await debtsApi.remove(deletingDebt.id);
            toast.success(t("debt removed"));
            setDeletingDebt(null);
            fetchDebts();
        } catch { toast.error(t("error")); }
    };

    const filtered = debts.filter((d) => d.customerName.toLowerCase().includes(search.toLowerCase()));

    const statusStyle = (status: string) => {
        if (status === "paid") return "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
        if (status === "partial") return "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
        return "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
    };

    return (
        <AppLayout title={t("debts")} subtitle={t("manage borrowing and installments")}>
            <div className="flex flex-col gap-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-2xl shadow-sm border border-border">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={t("search borrower...")}
                            className="pl-9 h-11 border-none bg-secondary/50 shadow-sm rounded-xl font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                        <DialogTrigger asChild>
                            <Button className="h-11 rounded-xl shadow-md gap-2 px-5 font-bold">
                                <Plus className="w-4 h-4" /> {t("issue debt")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                            <div className="bg-primary/5 p-6 border-b border-border/40">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-primary" /> {t("new borrowing")}
                                    </DialogTitle>
                                </DialogHeader>
                            </div>
                            <form onSubmit={handleAddDebt} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("borrower name")} *</Label>
                                        <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="bg-secondary/30 h-10 border-none rounded-xl font-bold" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("phone number")}</Label>
                                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-secondary/30 h-10 border-none rounded-xl font-bold" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("shop")} *</Label>
                                        <Select value={form.shop_id} onValueChange={(v) => setForm({ ...form, shop_id: v })}>
                                            <SelectTrigger className="bg-secondary/30 h-10 border-none rounded-xl font-bold"><SelectValue placeholder={t("select shop")} /></SelectTrigger>
                                            <SelectContent>{shops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("product")} ({t("optional")})</Label>
                                        <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                                            <SelectTrigger className="bg-secondary/30 h-10 border-none rounded-xl font-bold"><SelectValue placeholder={t("none")} /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{t("none")}</SelectItem>
                                                {products.filter((p) => !form.shop_id || p.shopId == form.shop_id).map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("total amount")} *</Label>
                                        <Input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} className="bg-secondary/30 h-10 border-none rounded-xl font-bold" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("initial paid amount")}</Label>
                                        <Input type="number" step="0.01" value={form.initial_payment} onChange={(e) => setForm({ ...form, initial_payment: e.target.value })} placeholder="0.00" className="bg-secondary/30 h-10 border-none rounded-xl font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-xs uppercase text-muted-foreground">{t("due date")}</Label>
                                    <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-secondary/30 h-10 border-none rounded-xl font-bold" />
                                </div>
                                <Button type="submit" className="w-full h-11 font-bold uppercase rounded-xl shadow-lg shadow-primary/20">{t("create debt")}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Debt Cards */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <p className="text-center text-muted-foreground p-8 italic">{t("loading debts...")}</p>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 text-center bg-card rounded-2xl border border-dashed border-border/60 opacity-40">
                            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-xl font-black italic">{t("no borrowings found")}</p>
                        </div>
                    ) : (
                        filtered.map((debt) => (
                            <div key={debt.id} className="bg-card p-5 rounded-2xl shadow-sm border border-border group hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg tracking-tight">
                                                {debt.customerName}
                                                {debt.phone && <span className="text-sm font-normal text-muted-foreground ml-2">({debt.phone})</span>}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t("issued")}: {new Date(debt.createdAt).toLocaleDateString()}</span>
                                                {debt.dueDate && <span className="flex items-center gap-1 text-destructive"><Calendar className="w-3.5 h-3.5" /> {t("due")}: {new Date(debt.dueDate).toLocaleDateString()}</span>}
                                            </div>
                                            {debt.product && <p className="text-xs font-mono mt-1 bg-secondary w-fit px-1.5 rounded">{debt.product.name} × {debt.quantity}</p>}
                                        </div>
                                    </div>

                                    {/* Right: Amounts + Status + Actions */}
                                    <div className="flex flex-col md:items-end gap-2">
                                        <div className="flex items-center justify-end gap-4 text-sm font-bold">
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase text-muted-foreground">{t("total")}</p>
                                                <p className="text-lg font-black">{formatTsh(debt.totalAmount)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase text-muted-foreground">{t("paid")}</p>
                                                <p className="text-base font-black text-emerald-600">{formatTsh(debt.amountPaid)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase text-muted-foreground">{t("balance")}</p>
                                                <p className="text-base font-black text-rose-500">{formatTsh(debt.totalAmount - debt.amountPaid)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-end flex-wrap">
                                            <Badge variant="outline" className={statusStyle(debt.status)}>{debt.status.toUpperCase()}</Badge>

                                            {/* Pay installment form */}
                                            {debt.status !== "paid" && (
                                                <form className="flex gap-2" onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const amount = (e.currentTarget.elements.namedItem("amount") as HTMLInputElement).value;
                                                    handlePay(debt.id, amount);
                                                    e.currentTarget.reset();
                                                }}>
                                                    <Input name="amount" type="number" step="0.01" min="1" max={debt.totalAmount - debt.amountPaid} placeholder="Tsh..." className="w-24 h-9 text-xs" required />
                                                    <Button type="submit" size="sm" className="h-9 font-bold">{t("pay installment")}</Button>
                                                </form>
                                            )}

                                            {/* Edit / Delete (permission-gated) */}
                                            {canManageDebts && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => handleOpenEdit(debt)}
                                                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => setDeletingDebt(debt)}
                                                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Debt Dialog */}
            <Dialog open={!!editingDebt} onOpenChange={(v) => !v && setEditingDebt(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-primary/5 p-6 border-b border-border/40">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black italic flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-primary" /> {t("edit debt")} – {editingDebt?.customerName}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleEditSave} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("borrower name")}</Label>
                                <Input value={editForm.customer_name} onChange={(e) => setEditForm((f) => ({ ...f, customer_name: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("phone number")}</Label>
                                <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("total amount")} (Tsh)</Label>
                                <Input type="number" step="0.01" value={editForm.total_amount} onChange={(e) => setEditForm((f) => ({ ...f, total_amount: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-[10px] uppercase text-muted-foreground">{t("due date")}</Label>
                                <Input type="date" value={editForm.due_date} onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))} className="h-11 bg-secondary/40 border-none rounded-xl font-bold" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingDebt(null)} className="flex-1 h-11 rounded-xl font-bold uppercase">{t("cancel")}</Button>
                            <Button type="submit" disabled={editLoading} className="flex-1 h-11 rounded-xl font-black uppercase shadow-lg shadow-primary/20">
                                {editLoading ? t("saving...") : t("save changes")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingDebt} onOpenChange={(v) => !v && setDeletingDebt(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black italic">{t("delete debt?")}</AlertDialogTitle>
                        <AlertDialogDescription className="text-base font-medium">
                            {t("this action cannot be undone.")} {t("borrower")}: <strong>{deletingDebt?.customerName}</strong>
                        </AlertDialogDescription>
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
