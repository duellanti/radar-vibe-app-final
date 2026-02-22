import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Eye, MessageCircle, EyeOff, Compass, Calendar, Check, Ban } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import ModalWrapper from "@/components/modal-wrapper";

interface PremiumModalProps {
  onClose: () => void;
  onSubscribe: (plan: string) => void;
}

export default function PremiumModal({ onClose, onSubscribe }: PremiumModalProps) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const features = [
    { icon: Eye, text: t("premium.feature1") },
    { icon: MessageCircle, text: t("premium.feature2") },
    { icon: Ban, text: t("premium.feature3") },
    { icon: EyeOff, text: t("premium.feature4") },
    { icon: Compass, text: t("premium.feature5") },
    { icon: Calendar, text: t("premium.feature6") },
  ];

  return (
    <ModalWrapper onClose={onClose} zIndex={9999}>
      <div className="max-w-md w-full">
        <div className="bg-card border border-primary/20 rounded-[20px] overflow-hidden">
          <div className="relative p-6 pb-4 text-center" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 0%, hsl(43 74% 49% / 0.12), transparent 70%)"
          }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/10">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary tracking-wide">
              {t("premium.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">
              {t("premium.subtitle")}
            </p>
          </div>

          <div className="px-6 pb-6">
            <div className="space-y-2.5 mb-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                data-testid="button-plan-monthly"
                onClick={() => setSelectedPlan("monthly")}
                className={`relative p-4 rounded-2xl border text-center transition-all active:scale-95 ${
                  selectedPlan === "monthly"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <p className="text-xl font-bold text-foreground">€1.99</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("premium.perMonth")}</p>
              </button>

              <button
                data-testid="button-plan-yearly"
                onClick={() => setSelectedPlan("yearly")}
                className={`relative p-4 rounded-2xl border text-center transition-all active:scale-95 ${
                  selectedPlan === "yearly"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <Badge variant="default" className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] rounded-full">
                  {t("premium.save")}
                </Badge>
                <p className="text-xl font-bold text-foreground">€8.99</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("premium.perYear")}</p>
              </button>
            </div>

            <Button
              data-testid="button-subscribe"
              onClick={() => onSubscribe(selectedPlan)}
              className="w-full font-semibold tracking-wider uppercase text-sm h-12 rounded-2xl active:scale-[0.98] transition-transform"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              {t("premium.subscribe")}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
