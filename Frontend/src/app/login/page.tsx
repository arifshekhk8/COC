"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setError("");
      setLoading(true);
      try {
        const { data } = await api.post("/api/auth/google/", {
          credential: response.credential,
        });
        setAuth(data.access, data.refresh, data.user);
        router.replace("/chat");
      } catch {
        setError("Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [setAuth, router]
  );

  useEffect(() => {
    if (initializedRef.current) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google || !buttonRef.current) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 320,
      });
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [handleCredentialResponse]);

  return (
    <div className="flex items-center justify-center min-h-[100dvh] p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">⚔️ COC Clan</CardTitle>
            <CardDescription>Sign in with your Google account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                Signing in…
              </div>
            )}
            <div ref={buttonRef} className="flex justify-center" />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
