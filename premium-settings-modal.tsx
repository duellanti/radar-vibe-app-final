import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Zap, Calendar, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { Vibe } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import ModalWrapper from "@/components/modal-wrapper";

function getTimeRemaining(expiresAt: string | Date): string {
  const end = new Date(expiresAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "-";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

interface VibeDetailProps {
  vibe: Vibe;
  onClose: () => void;
  distanceKm: number;
  onMessage?: () => void;
}

export default function VibeDetail({ vibe, onClose, distanceKm, onMessage }: VibeDetailProps) {
  const { t } = useTranslation();
  const timeLeft = getTimeRemaining(vibe.expiresAt);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [vibe.id]);

  const allPhotos: string[] = [];
  if (vibe.photos && vibe.photos.length > 0) {
    allPhotos.push(...vibe.photos);
  } else if (vibe.photoUrl) {
    allPhotos.push(vibe.photoUrl);
  }

  const nextSlide = () => setSlideIndex(i => (i + 1) % allPhotos.length);
  const prevSlide = () => setSlideIndex(i => (i - 1 + allPhotos.length) % allPhotos.length);

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-background border border-border rounded-[20px]">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur rounded-t-[20px] pr-12">
          <div className="flex items-center gap-2">
            {vibe.type === "live" ? (
              <Zap className="w-4 h-4 text-blue-400" />
            ) : (
              <Calendar className="w-4 h-4 text-primary" />
            )}
            <h2 data-testid="text-vibe-title" className="font-serif text-lg font-bold text-primary tracking-wide">{vibe.title}</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {allPhotos.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <img
                src={allPhotos[slideIndex]}
                alt=""
                className="w-full h-48 object-cover"
                data-testid="img-vibe-photo"
              />
              {allPhotos.length > 1 && (
                <>
                  <button
                    data-testid="button-slide-prev"
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    data-testid="button-slide-next"
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allPhotos.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? "bg-primary scale-125" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={vibe.type === "live" ? "default" : "secondary"} className="rounded-full">
              {vibe.type === "live" ? t("vibe.live") : t("vibe.planned")}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{t("vibe.expiresIn")}: {timeLeft}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{distanceKm.toFixed(1)} km</span>
            </div>
          </div>

          {vibe.description && (
            <p data-testid="text-vibe-description" className="text-sm text-foreground leading-relaxed">{vibe.description}</p>
          )}

          {vibe.scheduledAt && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/20">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground">
                {t("vibe.scheduled")}: {new Date(vibe.scheduledAt).toLocaleDateString()} - {new Date(vibe.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )}

          <div className="text-[10px] text-muted-foreground/60 text-center">
            {t("vibe.createdAgo")} {formatDistanceToNow(new Date(vibe.createdAt), { addSuffix: true })}
          </div>

          <div
            id="ad-banner-event"
            data-admob-slot="banner-event"
            style={{ minHeight: 0 }}
          />

          {onMessage && (
            <Button
              data-testid="button-message-creator"
              variant="outline"
              onClick={onMessage}
              className="w-full h-12 rounded-2xl active:scale-[0.98] transition-transform"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("vibe.messageCreator")}
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
