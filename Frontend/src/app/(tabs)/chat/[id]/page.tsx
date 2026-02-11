"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { api } from "@/lib/api";
import { useChatSocket } from "@/hooks/use-chat-socket";
import type { ChatMessage, WsChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Smile, Paperclip, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = Number(params.id);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const queryClient = useQueryClient();

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  // Fetch historical messages
  const { data: history = [] } = useQuery<ChatMessage[]>({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/chat/channels/${channelId}/messages/`
      );
      // API returns cursor-paginated; results are in .results
      return (data.results ?? data) as ChatMessage[];
    },
    enabled: !!channelId,
  });

  // WebSocket
  const { connected, messages: wsMessages, send, reset } = useChatSocket(
    channelId || null
  );

  // Reset WS messages when channel changes
  useEffect(() => {
    reset();
  }, [channelId, reset]);

  // Merge history + WS messages
  const allMessages = mergeMessages(history, wsMessages);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (allMessages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: allMessages.length - 1,
        behavior: "smooth",
      });
    }
  }, [allMessages.length]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (connected) {
      send(trimmed);
    } else {
      // REST fallback
      api
        .post(`/api/chat/channels/${channelId}/messages/`, { text: trimmed })
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ["messages", channelId] })
        );
    }
    setText("");
  }, [text, connected, send, channelId, queryClient]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <button onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">
          Channel #{channelId}
        </h1>
        {connected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-muted-foreground" />
        )}
      </header>

      {/* Messages */}
      <div className="flex-1">
        <Virtuoso
          ref={virtuosoRef}
          data={allMessages}
          initialTopMostItemIndex={allMessages.length > 0 ? allMessages.length - 1 : 0}
          alignToBottom
          followOutput="smooth"
          itemContent={(_, msg) => (
            <div className="flex gap-2 px-4 py-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {msg.sender_username?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">
                    {msg.sender_username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.text}</p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Composer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t bg-background px-3 py-2 safe-area-bottom shrink-0"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────
interface UnifiedMsg {
  id: number;
  text: string;
  sender_username: string;
  created_at: string;
}

function mergeMessages(
  history: ChatMessage[],
  ws: WsChatMessage[]
): UnifiedMsg[] {
  const histIds = new Set(history.map((m) => m.id));
  const base: UnifiedMsg[] = history.map((m) => ({
    id: m.id,
    text: m.text,
    sender_username: m.sender_username,
    created_at: m.created_at,
  }));
  const wsNew: UnifiedMsg[] = ws
    .filter((m) => !histIds.has(m.id))
    .map((m) => ({
      id: m.id,
      text: m.text,
      sender_username: m.sender.username,
      created_at: m.created_at,
    }));
  return [...base, ...wsNew];
}
