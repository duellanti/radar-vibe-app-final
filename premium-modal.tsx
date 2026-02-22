import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useEffect } from "react";

interface AdBannerProps {
  isPremium: boolean;
}

export default function AdBanner({ isPremium }: AdBannerProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const el = document.getElementById("ad-banner-footer");
    if (el) {
      el.style.display = isPremium ? "none" : "flex";
    }
    document.querySelectorAll('[data-admob-slot]').forEach((slot) => {
      (slot as HTMLElement).style.display = isPremium ? "none" : "block";
    });
  }, [isPremium]);

  if (isPremium) return null;

  return (
    <div
      id="ad-banner-footer"
      data-testid="ad-banner"
      data-admob-slot="banner-footer"
      className="fixed bottom-0 left-0 right-0 h-[50px] z-[50] bg-card border-t border-border flex items-center justify-center"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="px-3 py-1 border border-border/50 rounded-md text-[10px] uppercase tracking-widest">
          {t("ad.banner")}
        </div>
        <span className="text-primary/40 mx-2">|</span>
        <span className="text-[10px] text-primary/60 uppercase tracking-wider">{t("ad.removePremium")}</span>
      </div>
    </div>
  );
}

interface InterstitialAdProps {
  onClose: () => void;
  reason?: string;
}

export function InterstitialAd({ onClose, reason }: InterstitialAdProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/90 modal-overlay">
      <div className="relative max-w-sm w-full mx-6 modal-content">
        <button
          data-testid="button-close-interstitial"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 border border-border/50 rounded-md text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("ad.interstitial")}
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] flex items-center justify-center bg-muted/30">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-primary/30 flex items-center justify-center">
                <span className="text-2xl text-primary font-serif">RV</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">AdMob Interstitial</p>
              {reason && (
                <p className="text-[10px] text-primary/60 uppercase tracking-wider mt-2">{reason}</p>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-border">
            <button
              data-testid="button-dismiss-ad"
              onClick={onClose}
              className="w-full text-center text-xs text-primary uppercase tracking-widest py-2"
            >
              {t("ad.continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
