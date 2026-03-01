import { AppLayout } from "@/components/layout/AppLayout";
import { notifications } from "@/data/mockData";
import { AlertTriangle, CheckCircle, Clock, Info, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  pending: Clock,
  expiry: AlertTriangle,
  info: Info,
};

const colorMap = {
  warning: "text-warning bg-warning/10",
  success: "text-success bg-success/10",
  pending: "text-info bg-info/10",
  expiry: "text-destructive bg-destructive/10",
  info: "text-primary bg-primary/10",
};

const NotificationsPage = () => {
  return (
    <AppLayout title="Notifications" subtitle="Stay updated on stock and sales activity">
      <div className="space-y-2 max-w-2xl">
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = iconMap[n.type];
            return (
              <div
                key={n.id}
                className={cn(
                  "bg-card border border-border rounded-xl p-4 flex items-start gap-3 animate-slide-up",
                  !n.read && "border-l-2 border-l-primary"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0", colorMap[n.type])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
