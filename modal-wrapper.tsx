import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Compass, Search, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import ModalWrapper from "@/components/modal-wrapper";

interface BussolaUser {
  id: string;
  username: string;
  displayName: string | null;
  keywords: string[];
  latitude: number | null;
  longitude: number | null;
}

interface BussolaModalProps {
  onClose: () => void;
  onUserClick: (user: { id: string; name: string }) => void;
}

export default function BussolaModal({ onClose, onUserClick }: BussolaModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<BussolaUser[] | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (kw: string) => {
      const res = await apiRequest("GET", `/api/bussola?keyword=${encodeURIComponent(kw)}`);
      return res.json();
    },
    onSuccess: (data: BussolaUser[]) => {
      setResults(data);
    },
    onError: (err: any) => {
      const msg = err?.message || "";
      if (msg.includes("403") || msg.includes("Premium")) {
        toast({ title: t("vibe.premiumOnly"), variant: "destructive" });
      } else {
        toast({ title: t("common.error"), description: t("bussola.noResults"), variant: "destructive" });
      }
    },
  });

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-md max-h-[80vh] flex flex-col bg-background border border-border rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur shrink-0 pr-12">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-primary tracking-wide">{t("bussola.title")}</h2>
          </div>
        </div>

        <div className="p-4 space-y-3 shrink-0">
          <p className="text-xs text-muted-foreground">{t("bussola.subtitle")}</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="input-bussola-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("bussola.keyword")}
                className="pl-9 text-sm h-12 rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keyword.trim()) {
                    searchMutation.mutate(keyword.trim());
                  }
                }}
              />
            </div>
            <Button
              data-testid="button-bussola-search"
              onClick={() => {
                if (keyword.trim()) searchMutation.mutate(keyword.trim());
              }}
              disabled={!keyword.trim() || searchMutation.isPending}
              size="default"
              className="h-12 rounded-2xl active:scale-95 transition-transform"
            >
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("bussola.search")
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {results === null ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Compass className="w-10 h-10 text-primary/30" />
              <p className="text-xs text-muted-foreground text-center px-6">
                {t("bussola.subtitle")}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-muted-foreground">{t("bussola.noResults")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="px-4 py-2">
                <span className="text-xs text-muted-foreground">
                  {results.length} {t("bussola.found")}
                </span>
              </div>
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 active:bg-card transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm text-primary font-bold">
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.displayName || user.username}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(user.keywords || []).slice(0, 5).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px]">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    data-testid={`button-bussola-message-${user.id}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onUserClick({ id: user.id, name: user.displayName || user.username });
                      onClose();
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
