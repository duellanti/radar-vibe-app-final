import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Crown, EyeOff, LogOut, Loader2, Camera } from "lucide-react";
import { SiInstagram, SiDiscord, SiPlaystation } from "react-icons/si";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, languageNames } from "@/lib/i18n";
import ModalWrapper from "@/components/modal-wrapper";
import type { User } from "@shared/schema";

interface ProfileModalProps {
  user: Omit<User, "password">;
  onClose: () => void;
  onLogout: () => void;
  onAdTrigger?: (callback: () => void) => void;
}

export default function ProfileModal({ user, onClose, onLogout, onAdTrigger }: ProfileModalProps) {
  const { t, lang, setLang } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  const [form, setForm] = useState({
    displayName: user.displayName || "",
    bio: user.bio || "",
    instagram: user.instagram || "",
    discord: user.discord || "",
    psnId: user.psnId || "",
    keywords: (user.keywords || []).join(", "),
  });
  const [ghostMode, setGhostMode] = useState(user.ghostMode);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    if (user.isPremium) {
      uploadAvatar(file);
    } else {
      setShowVideoAd(true);
      setAdCountdown(5);
      const interval = setInterval(() => {
        setAdCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: t("profile.photoUpdated") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleAdClose = () => {
    setShowVideoAd(false);
    if (avatarFile) uploadAvatar(avatarFile);
  };

  const updateProfile = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/profile", {
        displayName: form.displayName || undefined,
        bio: form.bio || undefined,
        instagram: form.instagram || undefined,
        discord: form.discord || undefined,
        psnId: form.psnId || undefined,
        keywords: form.keywords.split(",").map((k: string) => k.trim()).filter(Boolean),
        language: lang,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: t("profile.save") });
    },
    onError: () => {
      toast({ title: t("common.error"), variant: "destructive" });
    },
  });

  const toggleGhost = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("POST", "/api/ghost-mode", { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const handleGhostToggle = (enabled: boolean) => {
    if (!user.isPremium) {
      toast({ title: t("premium.title"), description: t("profile.ghostMode") + " - " + t("vibe.premiumOnly"), variant: "destructive" });
      return;
    }
    setGhostMode(enabled);
    toggleGhost.mutate(enabled);
  };

  const currentAvatar = avatarPreview || user.avatarUrl;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-background border border-border rounded-[20px]">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur rounded-t-[20px]">
          <h2 className="font-serif text-lg font-bold text-primary tracking-wide">{t("profile.edit")}</h2>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-card-border">
            <button
              data-testid="button-change-avatar"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-14 h-14 rounded-full shrink-0 overflow-hidden group active:scale-95 transition-transform"
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl text-primary font-bold">{(user.displayName || user.username).charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{user.displayName || user.username}</p>
                {user.isPremium && (
                  <span data-testid="badge-vip" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/30">
                    <Crown className="w-3 h-3 text-primary" />
                    <span className="text-[9px] text-primary font-bold uppercase tracking-wider">VIP</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              <p className="text-[10px] text-primary/60 mt-0.5">{t("profile.tapToChange")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.displayName")}</Label>
            <Input
              data-testid="input-display-name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder={t("profile.displayName")}
              className="text-sm h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.bio")}</Label>
            <Textarea
              data-testid="input-bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder={t("profile.bioPlaceholder")}
              className="text-sm resize-none min-h-[60px] rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.socialLinks")}</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SiInstagram className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  data-testid="input-instagram"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@username"
                  className="text-sm h-12 rounded-2xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <SiDiscord className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  data-testid="input-discord"
                  value={form.discord}
                  onChange={(e) => setForm({ ...form, discord: e.target.value })}
                  placeholder="username#1234"
                  className="text-sm h-12 rounded-2xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <SiPlaystation className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  data-testid="input-psn"
                  value={form.psnId}
                  onChange={(e) => setForm({ ...form, psnId: e.target.value })}
                  placeholder="PSN ID"
                  className="text-sm h-12 rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.keywords")}</Label>
            <Input
              data-testid="input-keywords"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder={t("profile.keywordsPlaceholder")}
              className="text-sm h-12 rounded-2xl"
            />
            <p className="text-[10px] text-muted-foreground/60">{t("profile.keywordsHint")}</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl border border-border">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-xs text-foreground">{t("profile.ghostMode")}</span>
                <p className="text-[10px] text-muted-foreground">{t("profile.ghostDesc")}</p>
              </div>
            </div>
            <Switch
              data-testid="switch-ghost-mode"
              checked={ghostMode}
              onCheckedChange={handleGhostToggle}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.language")}</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(languageNames).map(([code, name]) => (
                <button
                  key={code}
                  data-testid={`button-lang-${code}`}
                  onClick={() => setLang(code)}
                  className={`text-[10px] py-2.5 px-2 rounded-2xl border text-center transition-all active:scale-95 ${
                    lang === code ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <Button
            data-testid="button-save-profile"
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="w-full font-semibold tracking-wider uppercase text-sm h-12 rounded-2xl active:scale-[0.98] transition-transform"
            size="lg"
          >
            {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("profile.save")}
          </Button>

          <button
            data-testid="button-logout"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-destructive py-3 rounded-2xl active:scale-[0.98] transition-transform"
          >
            <LogOut className="w-3 h-3" />
            {t("profile.logout")}
          </button>
        </div>
      </div>

      {showVideoAd && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95">
          <div className="max-w-sm w-full mx-6 bg-card border border-border rounded-[20px] overflow-hidden">
            <div className="aspect-video flex items-center justify-center bg-black relative">
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-primary/40 flex items-center justify-center animate-pulse">
                  <span className="text-3xl text-primary font-serif">RV</span>
                </div>
                <p className="text-sm text-white/80 mb-2">{t("ad.videoPlaceholder")}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{t("ad.interstitial")}</p>
              </div>
              {adCountdown > 0 && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm text-white font-bold">{adCountdown}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <Button
                data-testid="button-close-video-ad"
                onClick={handleAdClose}
                disabled={adCountdown > 0}
                className="w-full h-12 rounded-2xl font-semibold uppercase tracking-wider"
              >
                {adCountdown > 0 ? `${t("ad.wait")} ${adCountdown}s` : t("ad.continue")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}
