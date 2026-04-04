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
import { Wallet, Search, Plus, Calendar, User, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DebtsPage() {
    const { t } = useLanguage();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { isAdmin, filterShops } = usePermissions();
    const shopsRaw = useStore((s) => s.shops);
    const products = useStore((s) => s.products);
    const shops = filterShops(shopsRaw);

    const [openAdd, setOpenAdd] = useState(false);
    const [form, setForm] = useState({
        customer_name: "", phone: "", shop_id: shops[0]?.id || "", product_id: "none",
        quantity: "1", total_amount: "", initial_payment: "", due_date: ""
    });
    const { formatTsh } = useLanguage();

    const fetchDebts = async () => {
        setLoading(true);
        try {
            const data = await debtsApi.getAll();
            setDebts(data);
        } catch (e) {
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, []);

    const handleAddDebt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_name || !form.shop_id || !form.total_amount) {
            toast.error(t("please fill all required fields"));
            return;
        }

        try {
            await debtsApi.create({
                ...form,
                product_id: form.product_id === "none" ? null : form.product_id,
            });
            toast.success(t("success"));
            setOpenAdd(false);
            fetchDebts();
        } catch (error) {
            toast.error(t("error"));
        }
    };

    const handlePay = async (id: string, amount: string) => {
        if (!amount || parseFloat(amount) <= 0) return;
        try {
            await debtsApi.pay(id, parseFloat(amount));
            toast.success(t("success"));
            fetchDebts();
        } catch (error) {
            toast.error(t("error"));
        }
    };

    const filtered = debts.filter(d => d.customerName.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout title={t("debts")} subtitle={t("manage borrowing and installments")}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
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
                            <Button className="h-11 rounded-xl shadow-md gap-2 px-5 font-bold"><Plus className="w-4 h-4"/> {t("issue debt")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("new borrowing")}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddDebt} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("borrower name")} *</Label>
                                        <Input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="bg-secondary/30 h-10 border-none" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("phone number")}</Label>
                                        <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-secondary/30 h-10 border-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("shop")} *</Label>
                                        <Select value={form.shop_id} onValueChange={v => setForm({...form, shop_id: v})}>
                                            <SelectTrigger className="bg-secondary/30 h-10 border-none"><SelectValue placeholder={t("select shop")}/></SelectTrigger>
                                            <SelectContent>
                                                {shops.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("product")} ({t("optional")})</Label>
                                        <Select value={form.product_id} onValueChange={v => setForm({...form, product_id: v})}>
                                            <SelectTrigger className="bg-secondary/30 h-10 border-none"><SelectValue placeholder={t("none")}/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{t("none")}</SelectItem>
                                                {products.filter(p => !form.shop_id || p.shopId == form.shop_id).map(p => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("quantity")}</Label>
                                        <Input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="bg-secondary/30 h-10 border-none" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("total amount")} *</Label>
                                        <Input type="number" step="0.01" value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value})} className="bg-secondary/30 h-10 border-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("initial paid amount")}</Label>
                                        <Input type="number" step="0.01" value={form.initial_payment} onChange={e => setForm({...form, initial_payment: e.target.value})} placeholder="0.00" className="bg-secondary/30 h-10 border-none" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <Label className="font-bold text-xs uppercase text-muted-foreground">{t("due date")}</Label>
                                        <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="bg-secondary/30 h-10 border-none" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 font-bold uppercase">{t("create debt")}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <p className="text-center text-muted-foreground p-8">{t("loading debts...")}</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-muted-foreground p-8">{t("no borrowings found")}</p>
                    ) : (
                        filtered.map(debt => (
                            <div key={debt.id} className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{debt.customerName} {debt.phone && <span className="text-sm font-normal text-muted-foreground ml-2">({debt.phone})</span>}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {t("issued")}: {new Date(debt.createdAt).toLocaleDateString()}</span>
                                            {debt.dueDate && <span className="flex items-center gap-1 text-destructive"><Calendar className="w-3.5 h-3.5"/> {t("due")}: {new Date(debt.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                        {debt.product && <p className="text-xs font-mono mt-1 bg-secondary w-fit px-1.5 rounded">{debt.product.name} x {debt.quantity}</p>}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:items-end gap-1">
                                    <div className="text-right flex items-center justify-end gap-2 text-sm font-bold">
                                        <span className="text-[10px] uppercase text-muted-foreground">{t("total")}:</span> <span className="text-lg">{formatTsh(debt.totalAmount)}</span>
                                    </div>
                                    <div className="text-right flex items-center justify-end gap-2 text-sm font-bold text-emerald-600">
                                        <span className="text-[10px] uppercase opacity-70">{t("paid")}:</span> <span>{formatTsh(debt.amountPaid)}</span>
                                    </div>
                                    <div className="text-right flex items-center justify-end gap-2 text-sm font-black text-rose-600">
                                        <span className="text-[10px] uppercase opacity-70">{t("balance")}:</span> <span>{formatTsh(debt.totalAmount - debt.amountPaid)}</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-end">
                                        <Badge variant="outline" className={
                                            debt.status === 'paid' ? "border-green-200 bg-green-50 text-green-700" :
                                            debt.status === 'partial' ? "border-orange-200 bg-orange-50 text-orange-700" :
                                            "border-rose-200 bg-rose-50 text-rose-700"
                                        }>{debt.status.toUpperCase()}</Badge>
                                    </div>
                                </div>

                                {debt.status !== 'paid' && (
                                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                                        <form className="flex gap-2" onSubmit={(e) => {
                                            e.preventDefault();
                                            const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
                                            handlePay(debt.id, amount);
                                            e.currentTarget.reset();
                                        }}>
                                            <Input name="amount" type="number" step="0.01" min="1" max={debt.totalAmount - debt.amountPaid} placeholder="Tsh..." className="w-24 h-9" required />
                                            <Button type="submit" size="sm" className="h-9">{t("pay installment")}</Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
