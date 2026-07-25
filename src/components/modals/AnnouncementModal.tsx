import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announcementsApi, AnnouncementRecord } from "@/api/announcements.api";
import { Sparkles, X, PlayCircle, Eye, CheckCircle2, Megaphone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function getVideoEmbedUrl(url?: string): { type: "iframe" | "video" | "none"; embedUrl: string } {
    if (!url || !url.trim()) return { type: "none", embedUrl: "" };
    const clean = url.trim();

    // YouTube
    const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
        return { type: "iframe", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
    }

    // Vimeo
    const vimeoMatch = clean.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return { type: "iframe", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
    }

    // Direct MP4 / WebM / Video file
    if (clean.match(/\.(mp4|webm|ogg)$/i) || clean.startsWith("blob:") || clean.startsWith("data:")) {
        return { type: "video", embedUrl: clean };
    }

    return { type: "iframe", embedUrl: clean };
}

export function AnnouncementModal() {
    const [announcement, setAnnouncement] = useState<AnnouncementRecord | null>(null);
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        let isMounted = true;
        const checkAnnouncement = async () => {
            const active = await announcementsApi.getActive();
            if (!isMounted || !active) return;

            const isActive = active.is_active == true || String(active.is_active) === "1" || String(active.is_active) === "true";
            if (!isActive) return;

            const version = active.updated_at || active.created_at || "v1";
            const dismissedKey = `dismissed_announcement_${active.id}_${version}`;
            const isDismissed = localStorage.getItem(dismissedKey);
            if (!isDismissed) {
                setAnnouncement(active);
                setOpen(true);
            }
        };

        checkAnnouncement();
        return () => { isMounted = false; };
    }, []);

    if (!announcement || !open) return null;

    const handleDismiss = () => {
        if (announcement) {
            const version = announcement.updated_at || announcement.created_at || "v1";
            localStorage.setItem(`dismissed_announcement_${announcement.id}_${version}`, "true");
        }
        setOpen(false);
    };

    const media = getVideoEmbedUrl(announcement.video_url);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-2xl rounded-3xl border border-primary/20 shadow-2xl p-0 overflow-hidden bg-slate-950 text-white dark:border-primary/40 backdrop-blur-2xl">
                {/* Header Banner */}
                <div className="relative bg-gradient-to-r from-primary/30 via-indigo-600/30 to-purple-600/30 p-6 sm:p-8 border-b border-white/10">
                    <div className="absolute top-4 right-4 z-20">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDismiss}
                            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white border border-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-primary text-primary-foreground font-black tracking-wider uppercase text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                            <Megaphone className="w-3.5 h-3.5" /> System Update & Announcement
                        </Badge>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white italic drop-shadow-md pr-8">
                        {announcement.title}
                    </h2>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Video Player */}
                    {media.type !== "none" && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video group">
                            {media.type === "iframe" && (
                                <iframe
                                    src={media.embedUrl}
                                    title={announcement.title}
                                    className="w-full h-full border-none rounded-2xl"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                            {media.type === "video" && (
                                <video
                                    src={media.embedUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            )}
                        </div>
                    )}

                    {/* Text Description */}
                    {announcement.description && (
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <p className="text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-line">
                                {announcement.description}
                            </p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
                        <p className="text-xs text-slate-400 font-bold italic flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-primary animate-spin" /> Stay tuned for new updates!
                        </p>
                        <Button
                            onClick={handleDismiss}
                            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Got it, continue!
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
