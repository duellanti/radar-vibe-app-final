import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Palette, Lock, MapPin, Shield, Radar } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import ModalWrapper from "@/components/modal-wrapper";
import { useTheme, type ThemePreset } from "@/lib/theme";

interface PremiumSettingsModalProps {
  onClose: () => void;
  isPremium: boolean;
}

export default function PremiumSettingsModal({ onClose, isPremium }: PremiumSettingsModalProps) {
  const { t } = useTranslation();
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  const [localColors, setLocalColors] = useState(customColors);

  const themeOptions: { id: ThemePreset; nameKey: string; descKey: string; colors: string[] }[] = [
    {
      id: "dark_luxury",
      nameKey: "premSettings.darkLuxury",
      descKey: "premSettings.darkLuxuryDesc",
      colors: ["#0A0A0A", "#B8860B", "#121212"],
    },
    {
      id: "gold",
      nameKey: "premSettings.goldTheme",
      descKey: "premSettings.goldThemeDesc",
      colors: ["#2A1F0A", "#B8860B", "#3A2F1A"],
    },
    {
      id: "custom",
      nameKey: "premSettings.custom",
      descKey: "premSettings.customDesc",
      colors: [localColors.background, localColors.primary, localColors.card],
    },
  ];

  const premiumPerks = [
    { icon: MapPin, titleKey: "premSettings.exclusiveIcons", descKey: "premSettings.exclusiveIconsDesc", locked: true },
    { icon: Crown, titleKey: "premSettings.vipBadge", descKey: "premSettings.vipBadgeDesc", locked: false },
    { icon: Radar, titleKey: "premSettings.extendedRadar", descKey: "premSettings.extendedRadarDesc", locked: true },
    { icon: Shield, titleKey: "premSettings.priorityVisibility", descKey: "premSettings.priorityVisibilityDesc", locked: true },
  ];

  const handleApplyCustom = () => {
    setCustomColors(localColors);
    setTheme("custom");
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-background border border-border rounded-[20px]">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur rounded-t-[20px]">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-primary tracking-wide">{t("premSettings.title")}</h2>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Palette className="w-3 h-3" />
              {t("premSettings.theme")}
            </Label>

            <div className="space-y-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  data-testid={`button-theme-${opt.id}`}
                  onClick={() => {
                    if (!isPremium) return;
                    if (opt.id !== "custom") setTheme(opt.id);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left active:scale-[0.98] ${
                    theme === opt.id ? "border-primary bg-primary/5" : "border-border"
                  } ${!isPremium ? "opacity-50" : ""}`}
                >
                  <div className="flex gap-1 shrink-0">
                    {opt.colors.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{t(opt.nameKey)}</p>
                    <p className="text-[10px] text-muted-foreground">{t(opt.descKey)}</p>
                  </div>
                  {!isPremium && <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {isPremium && theme === "custom" && (
            <div className="space-y-3 p-3 rounded-2xl border border-primary/20 bg-primary/5">
              <Label className="text-xs uppercase tracking-wider text-primary">{t("premSettings.custom")}</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "primary", label: t("premSettings.primary") },
                  { key: "background", label: t("premSettings.background") },
                  { key: "card", label: t("premSettings.card") },
                  { key: "accent", label: t("premSettings.accent") },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        data-testid={`input-color-${key}`}
                        value={(localColors as any)[key]}
                        onChange={(e) => setLocalColors({ ...localColors, [key]: e.target.value })}
                        className="w-8 h-8 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={(localColors as any)[key]}
                        onChange={(e) => setLocalColors({ ...localColors, [key]: e.target.value })}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                data-testid="button-apply-custom-theme"
                onClick={handleApplyCustom}
                className="w-full text-xs rounded-2xl h-10 active:scale-[0.98] transition-transform"
                size="sm"
              >
                {t("premSettings.applyCustom")}
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Crown className="w-3 h-3" />
              {t("premSettings.perks")}
            </Label>

            <div className="space-y-2">
              {premiumPerks.map((perk, i) => (
                <div
                  key={i}
                  data-testid={`perk-${i}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    perk.locked ? "border-border opacity-60" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    perk.locked ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <perk.icon className={`w-4 h-4 ${perk.locked ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{t(perk.titleKey)}</p>
                    <p className="text-[10px] text-muted-foreground">{t(perk.descKey)}</p>
                  </div>
                  {perk.locked ? (
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider px-2 py-1 rounded-full bg-muted border border-border">
                      {t("premSettings.comingSoon")}
                    </span>
                  ) : (
                    <span className="text-[9px] text-primary uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                      {t("premSettings.active")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!isPremium && (
            <div className="text-center p-4 rounded-2xl border border-primary/20 bg-primary/5">
              <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-primary">{t("premSettings.upgrade")}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("premSettings.upgradeDesc")}</p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
