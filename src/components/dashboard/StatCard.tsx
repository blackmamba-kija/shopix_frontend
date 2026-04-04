import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  valueClassName?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor, className, valueClassName }: StatCardProps) {
  return (
    <div className={cn("stat-card-gradient rounded-[2rem] border border-border/40 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-black text-foreground tracking-tighter italic", valueClassName)}>{value}</p>
          {change && (
            <p
              className={cn(
                "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg w-fit",
                changeType === "positive" && "bg-emerald-500/10 text-emerald-600",
                changeType === "negative" && "bg-rose-500/10 text-rose-600",
                changeType === "neutral" && "bg-secondary text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3.5 rounded-2xl transition-colors group-hover:bg-primary group-hover:text-primary-foreground", iconColor || "bg-primary/5 text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
