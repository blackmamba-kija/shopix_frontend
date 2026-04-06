import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Wallet, FileText, Calendar, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const categories = [
    "Rent", "Electricity", "Water", "Salaries", "Maintenance", "Transport", "Other"
];

export function AddExpenseDialog() {
    const { addExpense, shops, selectedShopId } = useStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        shopId: selectedShopId === "all" ? "" : selectedShopId,
        amount: "",
        category: "Other",
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    const isInternalShop = shops.some(s => String(s.id) === String(formData.shopId));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.shopId || !formData.amount || !formData.category) {
            toast.error(t("please fill in all required fields"));
            return;
        }

        setLoading(true);
        try {
            await addExpense({
                shopId: formData.shopId,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: formData.date
            });
            toast.success(t("expense recorded successfully"));
            setFormData({
                shopId: selectedShopId === "all" ? "" : selectedShopId,
                amount: "",
                category: "Other",
                description: "",
                date: new Date().toISOString().split('T')[0]
            });
            setOpen(false);
        } catch (err) {
            toast.error(t("failed to record expense"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>{t("add expense")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <div className="bg-primary/5 p-8 pb-32 -mb-28">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                            <Wallet className="w-6 h-6 text-primary" />
                            {t("record new expense")}
                        </DialogTitle>
                        <DialogDescription className="font-medium italic opacity-70">
                            {t("track your operational costs effectively")}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 pt-0">
                    <div className="space-y-4 bg-white p-6 rounded-3xl shadow-xl border border-secondary/50">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                <Plus className="w-3 h-3" /> {t("select shop")} *
                            </Label>
                            <Select 
                                value={formData.shopId} 
                                onValueChange={(val) => setFormData(prev => ({ ...prev, shopId: val }))}
                            >
                                <SelectTrigger className="h-12 bg-secondary/40 border-none rounded-xl font-bold italic">
                                    <SelectValue placeholder={t("select shop")} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border shadow-xl">
                                    {shops.map(shop => (
                                        <SelectItem key={shop.id} value={String(shop.id)} className="font-bold italic">
                                            {shop.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> {t("category")} *
                                </Label>
                                <Select 
                                    value={formData.category} 
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                >
                                    <SelectTrigger className="h-12 bg-secondary/40 border-none rounded-xl font-bold italic">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat} className="font-bold italic">
                                                {t(cat.toLowerCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> {t("amount")} (Tsh) *
                                </Label>
                                <Input 
                                    type="number" 
                                    value={formData.amount} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    className="h-12 bg-secondary/40 border-none rounded-xl font-black italic text-rose-600"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {t("date")} *
                            </Label>
                            <Input 
                                type="date" 
                                value={formData.date} 
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="h-12 bg-secondary/40 border-none rounded-xl font-bold italic"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {t("description")}
                            </Label>
                            <Input 
                                value={formData.description} 
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="h-12 bg-secondary/40 border-none rounded-xl font-medium italic"
                                placeholder={t("details about the expense...")}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider bg-secondary/50 hover:bg-secondary"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-14 rounded-xl font-black italic uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                        >
                            {loading ? t("recording...") : t("record expense")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
