import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Play, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import ModalWrapper from "@/components/modal-wrapper";
import type { Message } from "@shared/schema";
import { FREE_MESSAGE_LIMIT } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface MessagingModalProps {
  currentUser: any;
  onClose: () => void;
  initialUserId?: string | null;
  initialUsername?: string | null;
  onAdTrigger: () => void;
}

export default function MessagingModal({ currentUser, onClose, initialUserId, initialUsername, onAdTrigger }: MessagingModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId || null);
  const [selectedUsername, setSelectedUsername] = useState<string>(initialUsername || "");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convLoading } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 10000,
  });

  const { data: chatMessages = [], isLoading: msgLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMsg = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content: message,
        type: "text",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setMessage("");
    },
    onError: (err: any) => {
      if (err.message?.includes("limit")) {
        toast({ title: t("msg.limitReached"), description: t("msg.watchAd"), variant: "destructive" });
      } else {
        toast({ title: t("common.error"), variant: "destructive" });
      }
    },
  });

  const unlockMessages = useMutation({
    mutationFn: async () => {
      onAdTrigger();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await apiRequest("POST", "/api/messages/unlock", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "3 bonus messages unlocked!" });
    },
  });

  const msgsRemaining = currentUser.isPremium ? Infinity : Math.max(0, FREE_MESSAGE_LIMIT - (currentUser.messagesToday || 0));

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-md h-[80vh] sm:h-[70vh] flex flex-col bg-background border border-border rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border bg-background/95 backdrop-blur shrink-0 pr-12">
          <div className="flex items-center gap-2">
            {selectedUserId && (
              <button data-testid="button-back-conversations" onClick={() => setSelectedUserId(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-serif text-base font-bold text-primary tracking-wide">
              {selectedUserId ? selectedUsername : t("header.messages")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!currentUser.isPremium && (
              <Badge variant="secondary" className="text-[10px] rounded-full">
                {msgsRemaining}/{FREE_MESSAGE_LIMIT}
              </Badge>
            )}
          </div>
        </div>

        {!selectedUserId ? (
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">{t("msg.noConversations")}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conv: any) => (
                  <button
                    key={conv.userId}
                    data-testid={`button-conversation-${conv.userId}`}
                    onClick={() => { setSelectedUserId(conv.userId); setSelectedUsername(conv.username); }}
                    className="w-full flex items-center gap-3 p-4 text-left active:bg-card transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm text-primary font-bold">{conv.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{conv.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">
                      {formatDistanceToNow(new Date(conv.lastAt), { addSuffix: true })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">{t("msg.startConversation")}</p>
                </div>
              ) : (
                chatMessages.map((msg: Message) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3.5 py-2.5 text-sm ${
                        isMine ? "bg-primary text-primary-foreground rounded-[18px] rounded-br-md" : "bg-card border border-border text-foreground rounded-[18px] rounded-bl-md"
                      }`}>
                        {msg.content}
                        <div className={`text-[9px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-border p-3 space-y-2">
              {!currentUser.isPremium && msgsRemaining <= 0 && (
                <Button
                  data-testid="button-watch-ad-messages"
                  variant="outline"
                  size="sm"
                  onClick={() => unlockMessages.mutate()}
                  disabled={unlockMessages.isPending}
                  className="w-full text-xs rounded-2xl h-10"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {unlockMessages.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : t("msg.watchAd")}
                </Button>
              )}
              <div className="flex gap-2">
                <Input
                  data-testid="input-chat-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("msg.placeholder")}
                  className="text-sm h-11 rounded-full"
                  disabled={!currentUser.isPremium && msgsRemaining <= 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim()) sendMsg.mutate();
                  }}
                />
                <Button
                  data-testid="button-send-message"
                  size="icon"
                  disabled={!message.trim() || sendMsg.isPending || (!currentUser.isPremium && msgsRemaining <= 0)}
                  onClick={() => { if (message.trim()) sendMsg.mutate(); }}
                  className="w-11 h-11 rounded-full shrink-0 active:scale-90 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}
