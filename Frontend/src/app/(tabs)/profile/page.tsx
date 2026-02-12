"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const storeUser = useAuthStore((s) => s.user);
  const { isSubscribed, isLoading: pushLoading, error: pushError, subscribe } =
    usePushSubscription();

  const { data: user } = useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/api/auth/me/");
      return data;
    },
  });

  const displayUser = user ?? storeUser;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <h1 className="text-lg font-bold flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-primary" />
        Profile
      </h1>

      {/* User card */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-14 w-14">
            {displayUser?.picture && (
              <AvatarImage
                src={displayUser.picture}
                alt={displayUser.name}
                referrerPolicy="no-referrer"
              />
            )}
            <AvatarFallback className="text-lg">
              {displayUser?.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{displayUser?.name}</p>
            <p className="text-sm text-muted-foreground">
              {displayUser?.email || "No email"}
            </p>
            <p className="text-xs text-muted-foreground">
              Joined{" "}
              {displayUser?.date_joined
                ? new Date(displayUser.date_joined).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isSubscribed ? (
            <p className="text-sm text-green-600 font-medium">
              ✅ Notifications enabled
            </p>
          ) : (
            <Button
              onClick={subscribe}
              disabled={pushLoading}
              className="w-full"
            >
              {pushLoading ? "Enabling…" : "Enable Notifications"}
            </Button>
          )}
          {pushError && (
            <p className="text-sm text-destructive">{pushError}</p>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
