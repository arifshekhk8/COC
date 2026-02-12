"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
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
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "527161504748-g7cunsdg6m0i7ebncershnftj5l66tqa.apps.googleusercontent.com";

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/google/", {
        id_token: response.credential,
      });
      setTokens(data.access, data.refresh);
      setUser(data.user);
      router.replace("/chat");
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { detail?: string }; status?: number } })?.response;
      if (resp?.status === 409) {
        setError(resp.data?.detail || "Email linked to a different Google account.");
      } else {
        setError(resp?.data?.detail || "Google sign-in failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const initGoogle = () => {
    if (!window.google || !btnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
    });
  };

  // Re-init when component mounts (script may already be cached)
  useEffect(() => {
    initGoogle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <div className="flex items-center justify-center min-h-[100dvh] p-4 bg-gradient-to-b from-green-50 to-white">
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
              <div ref={btnRef} className="min-h-[44px]" />
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  Signing in…
                </div>
              )}
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
