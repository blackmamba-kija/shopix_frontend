import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { AlertTriangle, CheckCircle, Clock, Info, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  pending: Clock,
  expiry: AlertTriangle,
  info: Info,
};

const colorMap = {
  warning: "text-amber-600 bg-amber-500/10",
  success: "text-emerald-600 bg-emerald-500/10",
  pending: "text-sky-600 bg-sky-500/10",
  expiry: "text-rose-600 bg-rose-500/10",
  info: "text-primary bg-primary/10",
};

const NotificationsPage = () => {
  const { t } = useLanguage();
  const notifications = useStore((s) => s.notifications);
  const markAsRead = useStore((s) => s.markNotificationAsRead);
  const setNotifications = useStore((s) => {
    // We don't have a direct clear action in useStore yet, so we'll just mark all as read or filter
    // For now, let's just use what's available.
    return s;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppLayout title={t("notifications")} subtitle={t("stay updated on stock and sales activity")}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-2xl font-black italic uppercase tracking-tighter">{t("recent activity")}</span>
             {unreadCount > 0 && (
               <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                 {unreadCount} NEW
               </div>
             )}
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                  className="text-xs font-bold text-muted-foreground hover:text-primary rounded-xl"
              >
                <Check className="w-3.5 h-3.5 mr-2" />
                {t("mark all as read")}
              </Button>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => useStore.getState().clearNotifications()}
                  className="text-xs font-bold text-muted-foreground hover:text-destructive rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {t("clear all")}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-card border border-border/50 border-dashed rounded-[2.5rem] text-center">
              <div className="w-16 h-16 bg-secondary/50 rounded-3xl flex items-center justify-center mb-4">
                 <Clock className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="font-black italic uppercase text-lg text-muted-foreground opacity-50">{t("all caught up!")}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-2 max-w-[200px]">
                {t("you have no new notifications at this time.")}
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = iconMap[n.type] || Info;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={cn(
                    "group bg-card border border-border/60 rounded-2xl p-4 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer relative overflow-hidden",
                    !n.read ? "border-l-4 border-l-primary shadow-sm" : "opacity-75 grayscale-[0.5]"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl shrink-0 shadow-sm", colorMap[n.type])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black uppercase tracking-tight text-foreground truncate">{n.title}</p>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {n.time}
                        </span>
                        {n.read && (
                           <span className="text-[9px] font-black uppercase text-emerald-600/60 tracking-widest flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {t("read")}
                           </span>
                        )}
                    </div>
                  </div>
                  
                  {/* Decorative corner element for unread */}
                  {!n.read && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-[2rem] pointer-events-none" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
