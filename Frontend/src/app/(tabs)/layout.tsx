"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Newspaper,
  Shield,
  Swords,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth-guard";

const tabs = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Feed", href: "/feed", icon: Newspaper },
  { name: "Clan", href: "/clan", icon: Shield },
  { name: "War", href: "/war", icon: Swords },
  { name: "Profile", href: "/profile", icon: User },
] as const;

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="flex flex-col h-[100dvh]">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom tab bar */}
        <nav className="border-t bg-background safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <button
                  key={tab.name}
                  onClick={() => router.push(tab.href)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 h-0.5 w-10 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
