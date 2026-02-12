"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CocPlayer } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CocIcon, TownHallIcon } from "@/components/coc-icon";
import type { AssetCategory } from "@/lib/coc-assets";
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
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ROLE_LABEL: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  elder: "Elder",
  member: "Member",
};

const ROLE_STYLE: Record<string, string> = {
  leader:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  coLeader:
    "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  admin:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  elder:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  member: "bg-secondary text-muted-foreground border-border",
};

type Tab = "heroes" | "troops" | "spells" | "equipment" | "achievements";

const TABS: { key: Tab; label: string }[] = [
  { key: "heroes", label: "Heroes" },
  { key: "troops", label: "Troops" },
  { key: "spells", label: "Spells" },
  { key: "equipment", label: "Equipment" },
  { key: "achievements", label: "Achievements" },
];

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawTag = params.tag as string;
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
      const tagForUrl = encodeURIComponent(playerTag.replace("#", ""));
      const { data } = await api.get(`/api/coc/players/${tagForUrl}/`);
      return data;
    },
    staleTime: 60_000,
  });

  // ── Loading ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-5 w-36 bg-muted rounded-lg animate-pulse" />
        </header>
        <div className="p-4 space-y-3">
          <div className="h-40 bg-muted/60 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-muted/40 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
          <div className="h-10 bg-muted/40 rounded-xl animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-muted/30 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────
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
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-destructive/60" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to load player</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {(error as Error)?.message || "Unknown error"}
          </p>
          <Button onClick={() => refetch()} size="lg" className="rounded-xl">
            Try Again
          </Button>
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
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur-sm shrink-0 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 rounded-lg bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{player.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="h-8 w-8 rounded-lg"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* ══════════════════════════════════════════════════
            PLAYER HEADER CARD
            ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                {/* TH + League */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <TownHallIcon level={player.townHallLevel} size={52} />
                  {player.league?.iconUrls?.medium ? (
                    <img
                      src={player.league.iconUrls.medium}
                      alt={player.league.name}
                      className="h-10 w-10"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-extrabold tracking-tight truncate">
                    {player.name}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    {player.tag}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-sm font-semibold">
                      TH{player.townHallLevel}
                    </span>
                    {player.townHallWeaponLevel && (
                      <span className="text-xs text-muted-foreground">
                        Weapon Lv.{player.townHallWeaponLevel}
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-sm">Lv.{player.expLevel}</span>
                    {player.role && (
                      <>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            ROLE_STYLE[player.role] || ROLE_STYLE.member
                          }`}
                        >
                          {ROLE_LABEL[player.role] || player.role}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Clan */}
              {player.clan && (
                <div className="flex items-center gap-2.5 bg-secondary/40 rounded-xl p-2.5 border border-border/30">
                  {player.clan.badgeUrls?.small && (
                    <img
                      src={player.clan.badgeUrls.small}
                      alt=""
                      className="h-9 w-9"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{player.clan.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Lv.{player.clan.clanLevel} · {player.clan.tag}
                    </p>
                  </div>
                </div>
              )}

              {/* Trophies */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold">
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

        {/* ══════════════════════════════════════════════════
            KEY STATS GRID
            ══════════════════════════════════════════════════ */}
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
              icon={<Zap className="h-4 w-4 text-emerald-500" />}
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
          <div className="flex items-center gap-1.5 text-sm">
            <Swords className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">War Preference:</span>
            <span
              className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                player.warPreference === "in"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/80 text-xs font-medium border border-border/50"
              >
                {l.iconUrls?.small && (
                  <img src={l.iconUrls.small} alt="" className="h-4 w-4" />
                )}
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TABS (Game-style segmented)
            ══════════════════════════════════════════════════ */}
        <div className="relative">
          <div className="flex bg-secondary/50 rounded-xl p-1 border border-border/50 gap-0.5 overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB CONTENT
            ══════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "heroes" && (
              <div className="space-y-3">
                {homeHeroes.length > 0 && (
                  <SectionHeader title="Home Village Heroes" />
                )}
                {homeHeroes.length > 0 && (
                  <UnitGrid items={homeHeroes} category="heroes" />
                )}
                {builderHeroes.length > 0 && (
                  <SectionHeader title="Builder Base Heroes" />
                )}
                {builderHeroes.length > 0 && (
                  <UnitGrid items={builderHeroes} category="heroes" />
                )}
                {homeHeroes.length === 0 && builderHeroes.length === 0 && (
                  <EmptyState text="No heroes unlocked yet" />
                )}
              </div>
            )}

            {activeTab === "troops" && (
              <div className="space-y-3">
                {homeTroops.length > 0 && (
                  <SectionHeader title="Home Village Troops" />
                )}
                {homeTroops.length > 0 && (
                  <UnitGrid items={homeTroops} category="troops" />
                )}
                {builderTroops.length > 0 && (
                  <SectionHeader title="Builder Base Troops" />
                )}
                {builderTroops.length > 0 && (
                  <UnitGrid items={builderTroops} category="troops" />
                )}
                {homeTroops.length === 0 && builderTroops.length === 0 && (
                  <EmptyState text="No troops unlocked yet" />
                )}
              </div>
            )}

            {activeTab === "spells" && (
              <div className="space-y-3">
                {homeSpells.length > 0 ? (
                  <>
                    <SectionHeader title="Spells" />
                    <UnitGrid items={homeSpells} category="spells" />
                  </>
                ) : (
                  <EmptyState text="No spells unlocked yet" />
                )}
              </div>
            )}

            {activeTab === "equipment" && (
              <div className="space-y-3">
                {player.heroEquipment.length > 0 ? (
                  <>
                    <SectionHeader title="Hero Equipment" />
                    <UnitGrid
                      items={player.heroEquipment}
                      category="equipment"
                    />
                  </>
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
                    .map((a) => {
                      const pct = Math.min(
                        (a.value / Math.max(a.target, 1)) * 100,
                        100
                      );
                      return (
                        <Card
                          key={a.name}
                          className="border-border/40 overflow-hidden"
                        >
                          <CardContent className="p-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5 shrink-0">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < a.stars
                                        ? "text-amber-500 fill-amber-500"
                                        : "text-muted-foreground/20"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">
                                  {a.name}
                                </p>
                              </div>
                              <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                                {a.value.toLocaleString()}/
                                {a.target.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {a.info}
                            </p>
                            {/* Progress bar */}
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct >= 100
                                    ? "bg-amber-500"
                                    : "bg-primary/70"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                ) : (
                  <EmptyState text="No achievements" />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Fan Content Disclaimer */}
        <div className="pt-4 pb-2">
          <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
            This material is unofficial and is not endorsed by Supercell. For
            more information see Supercell&apos;s Fan Content Policy:{" "}
            <a
              href="https://www.supercell.com/fan-content-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-muted-foreground"
            >
              www.supercell.com/fan-content-policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ── Reusable components ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

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
    <Card className="border-border/40">
      <CardContent className="p-3 text-center space-y-1">
        <div className="flex justify-center">{icon}</div>
        <p className="text-base font-bold leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground leading-none">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
      {title}
    </h3>
  );
}

function UnitGrid({
  items,
  category,
}: {
  items: Array<{
    name: string;
    level: number;
    maxLevel: number;
    superTroopIsActive?: boolean;
  }>;
  category: AssetCategory;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const isMaxed = item.level >= item.maxLevel;
        const pct = (item.level / Math.max(item.maxLevel, 1)) * 100;
        return (
          <Card
            key={item.name}
            className={`overflow-hidden border-border/40 ${
              item.superTroopIsActive
                ? "ring-1 ring-purple-500/60 bg-purple-500/5"
                : isMaxed
                ? "bg-amber-500/5"
                : ""
            }`}
          >
            <CardContent className="p-2 flex flex-col items-center gap-1">
              <CocIcon category={category} name={item.name} size={36} />
              <p
                className="text-[9px] text-center font-medium leading-tight line-clamp-1 w-full"
                title={item.name}
              >
                {item.name}
              </p>
              <p
                className={`text-xs font-bold leading-none ${
                  isMaxed ? "text-amber-600 dark:text-amber-400" : ""
                }`}
              >
                {item.level}
                <span className="text-muted-foreground font-normal text-[10px]">
                  /{item.maxLevel}
                </span>
              </p>
              {/* Mini progress bar */}
              <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isMaxed ? "bg-amber-500" : "bg-primary/60"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {item.superTroopIsActive && (
                <span className="text-[8px] text-purple-500 font-bold tracking-wide">
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
    <div className="text-center py-10">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
