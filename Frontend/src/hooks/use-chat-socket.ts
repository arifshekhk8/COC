"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { WsChatMessage } from "@/lib/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useChatSocket(channelId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WsChatMessage[]>([]);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Connect
  useEffect(() => {
    if (!channelId || !accessToken) return;

    const url = `${WS_URL}/ws/chat/${channelId}/?token=${accessToken}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data: WsChatMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        /* ignore non-JSON */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [channelId, accessToken]);

  // Send
  const send = useCallback(
    (text: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "chat.message", text }));
      }
    },
    []
  );

  // Reset messages (when switching channels)
  const reset = useCallback(() => setMessages([]), []);

  return { connected, messages, send, reset };
}
