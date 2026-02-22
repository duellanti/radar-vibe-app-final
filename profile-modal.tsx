import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Zap, Calendar, Loader2, Camera, X, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import ModalWrapper from "@/components/modal-wrapper";
import { LIVE_VIBE_DURATION_HOURS } from "@shared/schema";

interface CreateVibeModalProps {
  onClose: () => void;
  userLocation: { lat: number; lng: number };
  isPremium: boolean;
}

export default function CreateVibeModal({ onClose, userLocation, isPremium }: CreateVibeModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "live" as "live" | "planned",
    scheduledAt: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photoFiles.length;
    const newFiles = files.slice(0, remaining);

    setPhotoFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const createVibe = useMutation({
    mutationFn: async () => {
      const offsetLat = (Math.random() - 0.5) * 0.003;
      const offsetLng = (Math.random() - 0.5) * 0.003;

      let photoUrls: string[] = [];

      if (photoFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        photoFiles.forEach(f => formData.append("photos", f));
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        photoUrls = uploadData.urls;
        setUploading(false);
      }

      const body: any = {
        title: form.title,
        description: form.description,
        type: form.type,
        latitude: userLocation.lat + offsetLat,
        longitude: userLocation.lng + offsetLng,
        expiresAt: new Date(Date.now() + LIVE_VIBE_DURATION_HOURS * 60 * 60 * 1000).toISOString(),
        photos: photoUrls,
      };

      if (photoUrls.length > 0) {
        body.photoUrl = photoUrls[0];
      }

      if (form.type === "planned" && form.scheduledAt) {
        body.scheduledAt = new Date(form.scheduledAt).toISOString();
        const scheduledDate = new Date(form.scheduledAt);
        body.expiresAt = new Date(scheduledDate.getTime() + LIVE_VIBE_DURATION_HOURS * 60 * 60 * 1000).toISOString();
      }

      await apiRequest("POST", "/api/vibes", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vibes"] });
      toast({ title: t("vibe.create"), description: t("vibe.created") });
      onClose();
    },
    onError: () => {
      setUploading(false);
      toast({ title: t("common.error"), variant: "destructive" });
    },
  });

  const isValid = form.title.trim() && (form.type === "live" || (form.type === "planned" && form.scheduledAt));

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-background border border-border rounded-[20px]">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur rounded-t-[20px]">
          <h2 className="font-serif text-lg font-bold text-primary tracking-wide">{t("vibe.create")}</h2>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("vibe.title")}</Label>
            <Input
              data-testid="input-vibe-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("vibe.titlePlaceholder")}
              className="text-sm h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("vibe.description")}</Label>
            <Textarea
              data-testid="input-vibe-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("vibe.descPlaceholder")}
              className="text-sm resize-none min-h-[80px] rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("vibe.photo")} ({photoPreviews.length}/3)</Label>
            <div className="flex gap-2 flex-wrap">
              {photoPreviews.map((preview, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    data-testid={`button-remove-photo-${i}`}
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {photoFiles.length < 3 && (
                <button
                  data-testid="button-add-photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-95 transition-transform"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[9px] uppercase tracking-wider">{t("vibe.photo")}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("vibe.type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                data-testid="button-type-live"
                onClick={() => setForm({ ...form, type: "live" })}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                  form.type === "live" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <Zap className={`w-4 h-4 ${form.type === "live" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs uppercase tracking-wider ${
                  form.type === "live" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {t("vibe.live")}
                </span>
              </button>

              <button
                data-testid="button-type-planned"
                onClick={() => {
                  if (!isPremium) return;
                  setForm({ ...form, type: "planned" });
                }}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all relative active:scale-95 ${
                  form.type === "planned" ? "border-primary bg-primary/5" : "border-border"
                } ${!isPremium ? "opacity-50" : ""}`}
              >
                <Calendar className={`w-4 h-4 ${form.type === "planned" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs uppercase tracking-wider ${
                  form.type === "planned" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {t("vibe.planned")}
                </span>
                {!isPremium && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </button>
            </div>
          </div>

          {form.type === "planned" && isPremium && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("vibe.schedule")}</Label>
              <Input
                data-testid="input-scheduled-at"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="text-xs h-12 rounded-2xl"
              />
            </div>
          )}

          <div className="text-[10px] text-muted-foreground/60 text-center">
            {form.type === "live"
              ? t("vibe.liveExpiry").replace("{hours}", String(LIVE_VIBE_DURATION_HOURS))
              : t("vibe.premiumOnly")}
          </div>

          <Button
            data-testid="button-submit-vibe"
            onClick={() => createVibe.mutate()}
            disabled={!isValid || createVibe.isPending || uploading}
            className="w-full font-semibold tracking-wider uppercase text-sm h-12 rounded-2xl active:scale-[0.98] transition-transform"
            size="lg"
          >
            {(createVibe.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : t("vibe.create")}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
