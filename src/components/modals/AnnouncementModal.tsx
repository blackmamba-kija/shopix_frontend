import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announcementsApi, AnnouncementRecord } from "@/api/announcements.api";
import { Sparkles, X, Megaphone, CheckCircle2, ChevronDown, ChevronUp, Video } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function getVideoEmbedUrl(url?: string): { type: "iframe" | "video" | "none"; embedUrl: string } {
    if (!url || !url.trim()) return { type: "none", embedUrl: "" };
    const clean = url.trim();

    // YouTube - NO AUTOPLAY (autoplay=0)
    const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
        return { type: "iframe", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` };
    }

    // Vimeo - NO AUTOPLAY (autoplay=0)
    const vimeoMatch = clean.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return { type: "iframe", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0` };
    }

    // Direct MP4 / WebM / Video file
    if (clean.match(/\.(mp4|webm|ogg)$/i) || clean.startsWith("blob:") || clean.startsWith("data:")) {
        return { type: "video", embedUrl: clean };
    }

    return { type: "iframe", embedUrl: clean };
}

export function AnnouncementModal() {
    const [announcement, setAnnouncement] = useState<AnnouncementRecord | null>(null);
    const [minimized, setMinimized] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        let isMounted = true;
        const checkAnnouncement = async () => {
            const active = await announcementsApi.getActive();
            if (!isMounted) return;

            if (!active) {
                setAnnouncement(null);
                return;
            }

            const isActive = active.is_active == true || String(active.is_active) === "1" || String(active.is_active) === "true";
            if (isActive) {
                setAnnouncement(active);
            } else {
                setAnnouncement(null);
            }
        };

        checkAnnouncement();
        // Periodically poll active status every 20 seconds so status changes reflect live
        const interval = setInterval(checkAnnouncement, 20000);
        return () => { isMounted = false; clearInterval(interval); };
    }, []);

    if (!announcement) return null;

    const handleDismiss = () => {
        if (announcement) {
            const version = announcement.updated_at || announcement.created_at || "v1";
            localStorage.setItem(`dismissed_announcement_${announcement.id}_${version}`, "true");
        }
        setOpen(false);
    };

    const media = getVideoEmbedUrl(announcement.video_url);

    return (
        <div className="fixed top-20 right-4 lg:right-6 z-50 w-[92vw] sm:w-[420px] shadow-2xl rounded-3xl border border-primary/30 bg-slate-950 text-white backdrop-blur-2xl animate-in slide-in-from-top-5 duration-500 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary/30 via-indigo-600/30 to-purple-600/30 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                        <Megaphone className="w-3 h-3" /> System Update
                    </Badge>
                    <h3 className="text-sm font-black text-white italic truncate pr-2">
                        {announcement.title}
                    </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMinimized(!minimized)}
                        className="h-8 px-3 rounded-full bg-black/40 hover:bg-black/80 text-white border border-white/10 font-bold text-xs gap-1"
                    >
                        {minimized ? (
                            <>Expand <ChevronDown className="w-3.5 h-3.5" /></>
                        ) : (
                            <>Minimize <ChevronUp className="w-3.5 h-3.5" /></>
                        )}
                    </Button>
                </div>
            </div>

            {/* Expandable Body */}
            {!minimized && (
                <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Video Player — NO AUTOPLAY */}
                    {media.type !== "none" && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black aspect-video">
                            {media.type === "iframe" && (
                                <iframe
                                    src={media.embedUrl}
                                    title={announcement.title}
                                    className="w-full h-full border-none rounded-2xl"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                            {media.type === "video" && (
                                <video
                                    src={media.embedUrl}
                                    controls
                                    autoPlay={false}
                                    preload="metadata"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            )}
                        </div>
                    )}

                    {/* Text Description */}
                    {announcement.description && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                            <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-line">
                                {announcement.description}
                            </p>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
                        <p className="text-[10px] text-slate-400 font-bold italic flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary animate-spin" /> Click play to watch video
                        </p>
                        <Button
                            onClick={() => setMinimized(true)}
                            size="sm"
                            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Minimize
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
