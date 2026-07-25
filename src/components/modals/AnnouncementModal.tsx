import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announcementsApi, AnnouncementRecord } from "@/api/announcements.api";
import { Sparkles, Megaphone, Maximize2, Minimize2, Video } from "lucide-react";
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
    const [minimized, setMinimized] = useState(true);
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
        // Check every 10 seconds so all users (sellers, viewers, admins) see active updates live!
        const interval = setInterval(checkAnnouncement, 10000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (!announcement) return null;

    const media = getVideoEmbedUrl(announcement.video_url);

    return (
        <div
            className={cn(
                "fixed top-16 right-2 sm:right-6 z-[9999] shadow-2xl rounded-2xl sm:rounded-3xl border border-primary/50 bg-slate-950 text-white backdrop-blur-2xl transition-all duration-300 overflow-hidden",
                minimized ? "w-auto max-w-[calc(100vw-1rem)] sm:max-w-[420px]" : "w-[94vw] sm:w-[450px]"
            )}
        >
            {/* Minimized Top-Right Banner Bar */}
            <div
                className="bg-gradient-to-r from-primary/40 via-indigo-600/40 to-purple-600/40 p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setMinimized(!minimized)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                        <Megaphone className="w-3 h-3" /> System Announcement
                    </Badge>
                    <h3 className="text-xs font-black text-white italic truncate pr-1">
                        {announcement.title}
                    </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMinimized(!minimized);
                        }}
                        className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black gap-1.5 shadow-sm"
                    >
                        {minimized ? (
                            <>
                                <Maximize2 className="w-3.5 h-3.5 text-primary" /> Expand
                            </>
                        ) : (
                            <>
                                <Minimize2 className="w-3.5 h-3.5" /> Minimize
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Expanded Body */}
            {!minimized && (
                <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
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
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                            <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-line">
                                {announcement.description}
                            </p>
                        </div>
                    )}

                    {/* Action Bar — Minimize only, never disappear */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                        <p className="text-[10px] text-slate-400 font-bold italic flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" /> Click play to watch video
                        </p>
                        <Button
                            onClick={() => setMinimized(true)}
                            size="sm"
                            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                        >
                            <Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Minimize
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
