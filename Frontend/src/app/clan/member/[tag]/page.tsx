"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CocPlayer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trophy,
  Star,
  Swords,
  Shield,
  Hammer,
  Crown,
  Heart,
  RefreshCw,
  Zap,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const ROLE_LABEL: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  elder: "Elder",
  member: "Member",
};

type Tab = "heroes" | "troops" | "spells" | "equipment" | "achievements";

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawTag = params.tag as string;
  // Reconstruct the full tag: add '#' back and decode
  const playerTag = `#${decodeURIComponent(rawTag)}`;

  const [activeTab, setActiveTab] = useState<Tab>("heroes");

  const {
    data: player,
    isLoading,
    error,
    refetch,
  } = useQuery<CocPlayer>({
    queryKey: ["coc-player", playerTag],
    queryFn: async () => {
      // Send the tag WITHOUT '#' to the backend URL
      const tagForUrl = encodeURIComponent(playerTag.replace("#", ""));
      const { data } = await api.get(`/api/coc/players/${tagForUrl}/`);
      return data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </header>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-bold">Error</span>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <Shield className="h-16 w-16 text-destructive/50 mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load player</h2>
          <p className="text-muted-foreground mb-4">
            {(error as Error)?.message || "Unknown error"}
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const homeTroops = player.troops.filter((t) => t.village === "home");
  const builderTroops = player.troops.filter(
    (t) => t.village === "builderBase"
  );
  const homeSpells = player.spells.filter((s) => s.village === "home");
  const homeHeroes = player.heroes.filter((h) => h.village === "home");
  const builderHeroes = player.heroes.filter(
    (h) => h.village === "builderBase"
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{player.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* ── Player Header Card ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* League badge */}
                <div className="h-14 w-14 shrink-0 flex items-center justify-center">
                  {player.league?.iconUrls?.medium ? (
                    <img
                      src={player.league.iconUrls.medium}
                      alt={player.league.name}
                      className="h-14 w-14"
                    />
                  ) : (
                    <Trophy className="h-10 w-10 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold truncate">{player.name}</h2>
                  <p className="text-xs text-muted-foreground">{player.tag}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                    <span className="font-medium">TH{player.townHallLevel}</span>
                    {player.townHallWeaponLevel && (
                      <span className="text-xs text-muted-foreground">
                        (Weapon Lv.{player.townHallWeaponLevel})
                      </span>
                    )}
                    <span className="text-muted-foreground">·</span>
                    <span>Lv.{player.expLevel}</span>
                    {player.role && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-primary text-xs font-medium">
                          {ROLE_LABEL[player.role] || player.role}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Clan info */}
              {player.clan && (
                <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded-lg p-2">
                  {player.clan.badgeUrls?.small && (
                    <img
                      src={player.clan.badgeUrls.small}
                      alt=""
                      className="h-8 w-8"
                    />
                  )}
                  <div>
                    <p className="font-medium">{player.clan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Lv.{player.clan.clanLevel} · {player.clan.tag}
                    </p>
                  </div>
                </div>
              )}

              {/* Trophies row */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">
                    {player.trophies.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Best: {player.bestTrophies.toLocaleString()}
                </span>
                {player.league && (
                  <span className="text-xs text-muted-foreground">
                    {player.league.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Key Stats Grid ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              icon={<Star className="h-4 w-4 text-amber-500" />}
              label="War Stars"
              value={player.warStars}
            />
            <StatCard
              icon={<Swords className="h-4 w-4 text-red-500" />}
              label="Attacks"
              value={player.attackWins}
            />
            <StatCard
              icon={<Shield className="h-4 w-4 text-blue-500" />}
              label="Defenses"
              value={player.defenseWins}
            />
            <StatCard
              icon={<Zap className="h-4 w-4 text-green-500" />}
              label="Donated"
              value={player.donations}
            />
            <StatCard
              icon={<Heart className="h-4 w-4 text-pink-500" />}
              label="Received"
              value={player.donationsReceived}
            />
            <StatCard
              icon={<Crown className="h-4 w-4 text-purple-500" />}
              label="Capital"
              value={player.clanCapitalContributions ?? 0}
            />
            {player.builderHallLevel && (
              <>
                <StatCard
                  icon={<Hammer className="h-4 w-4 text-orange-500" />}
                  label="BH Level"
                  value={player.builderHallLevel}
                />
                <StatCard
                  icon={<Trophy className="h-4 w-4 text-orange-400" />}
                  label="BH Trophies"
                  value={player.builderBaseTrophies ?? 0}
                />
                <StatCard
                  icon={<Target className="h-4 w-4 text-orange-300" />}
                  label="BH Best"
                  value={player.bestBuilderBaseTrophies ?? 0}
                />
              </>
            )}
          </div>
        </motion.div>

        {/* War Preference */}
        {player.warPreference && (
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Swords className="h-3.5 w-3.5" />
            War Preference:{" "}
            <span
              className={`font-medium ${
                player.warPreference === "in"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {player.warPreference === "in" ? "Opted In" : "Opted Out"}
            </span>
          </div>
        )}

        {/* Labels */}
        {player.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {player.labels.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs"
              >
                {l.iconUrls?.small && (
                  <img src={l.iconUrls.small} alt="" className="h-3.5 w-3.5" />
                )}
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {(
            [
              ["heroes", "Heroes"],
              ["troops", "Troops"],
              ["spells", "Spells"],
              ["equipment", "Equipment"],
              ["achievements", "Achievements"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs whitespace-nowrap"
              onClick={() => setActiveTab(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "heroes" && (
            <div className="space-y-2">
              {homeHeroes.length > 0 && (
                <Section title="Home Village Heroes">
                  <UnitGrid
                    items={homeHeroes.map((h) => ({
                      name: h.name,
                      level: h.level,
                      maxLevel: h.maxLevel,
                    }))}
                  />
                </Section>
              )}
              {builderHeroes.length > 0 && (
                <Section title="Builder Base Heroes">
                  <UnitGrid
                    items={builderHeroes.map((h) => ({
                      name: h.name,
                      level: h.level,
                      maxLevel: h.maxLevel,
                    }))}
                  />
                </Section>
              )}
              {homeHeroes.length === 0 && builderHeroes.length === 0 && (
                <EmptyState text="No heroes unlocked yet" />
              )}
            </div>
          )}

          {activeTab === "troops" && (
            <div className="space-y-2">
              {homeTroops.length > 0 && (
                <Section title="Home Village Troops">
                  <UnitGrid
                    items={homeTroops.map((t) => ({
                      name: t.name,
                      level: t.level,
                      maxLevel: t.maxLevel,
                      active: t.superTroopIsActive,
                    }))}
                  />
                </Section>
              )}
              {builderTroops.length > 0 && (
                <Section title="Builder Base Troops">
                  <UnitGrid
                    items={builderTroops.map((t) => ({
                      name: t.name,
                      level: t.level,
                      maxLevel: t.maxLevel,
                    }))}
                  />
                </Section>
              )}
            </div>
          )}

          {activeTab === "spells" && (
            <div className="space-y-2">
              {homeSpells.length > 0 ? (
                <Section title="Spells">
                  <UnitGrid
                    items={homeSpells.map((s) => ({
                      name: s.name,
                      level: s.level,
                      maxLevel: s.maxLevel,
                    }))}
                  />
                </Section>
              ) : (
                <EmptyState text="No spells unlocked yet" />
              )}
            </div>
          )}

          {activeTab === "equipment" && (
            <div className="space-y-2">
              {player.heroEquipment.length > 0 ? (
                <Section title="Hero Equipment">
                  <UnitGrid
                    items={player.heroEquipment.map((e) => ({
                      name: e.name,
                      level: e.level,
                      maxLevel: e.maxLevel,
                    }))}
                  />
                </Section>
              ) : (
                <EmptyState text="No equipment unlocked yet" />
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-1.5">
              {player.achievements.length > 0 ? (
                player.achievements
                  .filter((a) => a.village === "home")
                  .sort((a, b) => b.stars - a.stars)
                  .map((a) => (
                    <Card key={a.name}>
                      <CardContent className="p-2.5 flex items-center gap-2">
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < a.stars
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {a.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {a.info}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {a.value}/{a.target}
                        </span>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <EmptyState text="No achievements" />
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ── Reusable components ──────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-2.5 text-center">
        <div className="flex justify-center mb-1">{icon}</div>
        <p className="text-sm font-bold">{value.toLocaleString()}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function UnitGrid({
  items,
}: {
  items: Array<{
    name: string;
    level: number;
    maxLevel: number;
    active?: boolean;
  }>;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {items.map((item) => {
        const isMaxed = item.level >= item.maxLevel;
        return (
          <Card
            key={item.name}
            className={`${
              item.active
                ? "ring-1 ring-purple-500 bg-purple-500/5"
                : isMaxed
                ? "bg-amber-500/5"
                : ""
            }`}
          >
            <CardContent className="p-1.5 text-center">
              <p className="text-[10px] truncate font-medium" title={item.name}>
                {item.name}
              </p>
              <p
                className={`text-xs font-bold ${
                  isMaxed ? "text-amber-600" : ""
                }`}
              >
                {item.level}
                <span className="text-muted-foreground font-normal">
                  /{item.maxLevel}
                </span>
              </p>
              {item.active && (
                <span className="text-[9px] text-purple-500 font-medium">
                  ACTIVE
                </span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-center text-sm text-muted-foreground py-6">{text}</p>
  );
}
