import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { Shop } from "@/types/models";
import { toast } from "sonner";
import { CalendarDays, CreditCard, Store, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageSubscriptionDialogProps {
  shop: Shop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBSCRIPTION_TYPES = [
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "custom", label: "Custom" },
];

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

export function ManageSubscriptionDialog({ shop, open, onOpenChange }: ManageSubscriptionDialogProps) {
  const updateSubscription = useStore((s) => s.updateSubscription);
  const updateShop = useStore((s) => s.updateShop);

  const [isPaid, setIsPaid] = useState(shop.isPaid ?? false);
  const [amount, setAmount] = useState(String(shop.subscriptionAmount ?? ""));
  const [subType, setSubType] = useState(shop.subscriptionType ?? "");
  const [paymentDate, setPaymentDate] = useState(shop.paymentDate ?? new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(shop.subscriptionStartDate ?? new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(shop.subscriptionEndDate ?? "");
  const [shopStatus, setShopStatus] = useState<"active" | "inactive">(shop.status);
  const [loading, setLoading] = useState(false);

  // Auto-compute end date when type or start date changes
  useEffect(() => {
    if (subType === "6_months" && startDate) {
      setEndDate(addMonths(startDate, 6));
    } else if (subType === "1_year" && startDate) {
      setEndDate(addMonths(startDate, 12));
    }
  }, [subType, startDate]);

  useEffect(() => {
    setIsPaid(shop.isPaid ?? false);
    setAmount(String(shop.subscriptionAmount ?? ""));
    setSubType(shop.subscriptionType ?? "");
    setPaymentDate(shop.paymentDate ?? new Date().toISOString().split("T")[0]);
    setStartDate(shop.subscriptionStartDate ?? new Date().toISOString().split("T")[0]);
    setEndDate(shop.subscriptionEndDate ?? "");
    setShopStatus(shop.status);
  }, [shop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subType || !paymentDate || !startDate || !endDate || !amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await updateSubscription(shop.id, {
        is_paid: isPaid,
        subscription_amount: parseFloat(amount),
        subscription_type: subType,
        payment_date: paymentDate,
        subscription_start_date: startDate,
        subscription_end_date: endDate,
        status: shopStatus,
      });
      toast.success("Subscription updated successfully!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update subscription.");
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = {
    active: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    unpaid: <XCircle className="w-4 h-4 text-rose-500" />,
    expired: <Clock className="w-4 h-4 text-amber-500" />,
  }[shop.subscriptionStatus] ?? null;

  const statusColor = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    unpaid: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    expired: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  }[shop.subscriptionStatus] ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Manage Subscription</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Store className="w-3 h-3" /> {shop.name}
              </p>
            </div>
            <Badge className={cn("ml-auto capitalize text-xs border", statusColor)}>
              {statusIcon}
              <span className="ml-1">{shop.subscriptionStatus}</span>
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-1">
          {/* Is Paid Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
            <div>
              <p className="text-sm font-bold text-foreground">Payment Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mark this shop as paid or unpaid</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold", isPaid ? "text-emerald-600" : "text-rose-500")}>
                {isPaid ? "Paid" : "Unpaid"}
              </span>
              <Switch
                checked={isPaid}
                onCheckedChange={setIsPaid}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Subscription Type */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-semibold">Subscription Duration *</Label>
              <Select value={subType} onValueChange={setSubType}>
                <SelectTrigger className="w-full bg-background border-border h-10">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Amount (Tsh) *</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background border-border h-10"
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Payment Date *</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="bg-background border-border h-10"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-border h-10"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center gap-1">
                End Date *
                {subType !== "custom" && (
                  <span className="text-[9px] font-bold text-primary/60 uppercase tracking-wide bg-primary/10 px-1.5 py-0.5 rounded">Auto</span>
                )}
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                readOnly={subType !== "custom"}
                className={cn("bg-background border-border h-10", subType !== "custom" && "opacity-70 cursor-default")}
              />
            </div>
          </div>

          {/* Shop Status */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Shop Access Status</Label>
            <Select value={shopStatus} onValueChange={(v) => setShopStatus(v as "active" | "inactive")}>
              <SelectTrigger className="w-full bg-background border-border h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active</span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-rose-500" /> Inactive (Deactivate)</span>
                </SelectItem>
              </SelectContent>
            </Select>
            {shopStatus === "inactive" && (
              <p className="text-xs text-rose-500 font-medium mt-1">⚠️ Deactivating will prevent the shop from being used.</p>
            )}
          </div>

          {/* Summary Card */}
          {isPaid && amount && startDate && endDate && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-black text-primary uppercase tracking-wider">Subscription Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">Tsh {parseFloat(amount || "0").toLocaleString()}</span>
                <span className="text-muted-foreground">Duration</span>
                <span className="font-bold text-foreground">{SUBSCRIPTION_TYPES.find(t => t.value === subType)?.label ?? "-"}</span>
                <span className="text-muted-foreground">Start</span>
                <span className="font-bold text-foreground">{startDate}</span>
                <span className="text-muted-foreground">Expires</span>
                <span className="font-bold text-foreground">{endDate}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="flex-1 h-10 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl font-bold shadow-lg shadow-primary/20">
              {loading ? "Saving..." : "Save Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
