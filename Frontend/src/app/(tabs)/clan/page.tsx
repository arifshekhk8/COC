"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CocClan, CocClanMember } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TownHallIcon } from "@/components/coc-icon";
import {
  Users,
  Trophy,
  Swords,
  Crown,
  Search,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Hammer,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Role helpers ────────────────────────────────────────────────────
const ROLE_ORDER: Record<string, number> = {
  leader: 0,
  coLeader: 1,
  admin: 2,
  elder: 2,
  member: 3,
};

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

type SortKey = "trophies" | "role" | "townHall";

export default function ClanPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("trophies");
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    data: clan,
    isLoading: clanLoading,
    error: clanError,
    refetch: refetchClan,
  } = useQuery<CocClan>({
    queryKey: ["coc-clan"],
    queryFn: async () => {
      const { data } = await api.get("/api/coc/clan/");
      return data;
    },
    staleTime: 30_000,
  });

  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery<CocClanMember[]>({
    queryKey: ["coc-clan-members"],
    queryFn: async () => {
      const { data } = await api.get("/api/coc/clan/members/");
      return data;
    },
    staleTime: 30_000,
  });

  const handleRefresh = () => {
    refetchClan();
    refetchMembers();
  };

  // Filter + sort → displayRank = index + 1 (fixes ranking bug)
  const filtered = useMemo(() => {
    let list = members.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.tag.toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      if (sortBy === "trophies") return b.trophies - a.trophies;
      if (sortBy === "townHall") return b.townHallLevel - a.townHallLevel;
      if (sortBy === "role")
        return (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
      return 0;
    });
    return list;
  }, [members, search, sortBy]);

  const navigateToPlayer = (tag: string) => {
    const encoded = encodeURIComponent(tag.replace("#", ""));
    router.push(`/clan/member/${encoded}`);
  };

  // ── Loading ────────────────────────────────────────────
  if (clanLoading || membersLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-muted rounded-lg w-24" />
          <div className="h-48 bg-muted/60 rounded-2xl" />
          <div className="h-10 bg-muted/40 rounded-xl" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] bg-muted/40 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────
  if (clanError || membersError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Shield className="h-10 w-10 text-destructive/60" />
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to load clan</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          {(clanError as Error)?.message ||
            (membersError as Error)?.message ||
            "Something went wrong"}
        </p>
        <Button onClick={handleRefresh} size="lg" className="rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  const desc = clan?.description || "";
  const descLong = desc.length > 100;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* ══════════════════════════════════════════════════
            CLAN HEADER CARD
            ══════════════════════════════════════════════════ */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight">Clan</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-9 w-9 rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {clan && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg dark:shadow-none bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-5 space-y-4">
                  {/* Badge + Name + Level */}
                  <div className="flex items-start gap-4">
                    {clan.badgeUrls?.medium && (
                      <div className="relative shrink-0">
                        <img
                          src={clan.badgeUrls.medium}
                          alt="Clan badge"
                          className="h-[72px] w-[72px] drop-shadow-md"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                          {clan.clanLevel}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pt-1">
                      <h2 className="text-2xl font-extrabold tracking-tight truncate">
                        {clan.name}
                      </h2>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {clan.tag}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {clan.members}
                          </span>
                          /50
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat
                      icon={<Trophy className="h-4 w-4 text-yellow-500" />}
                      label="Trophies"
                      value={clan.clanPoints?.toLocaleString() ?? "0"}
                    />
                    <MiniStat
                      icon={<Hammer className="h-4 w-4 text-orange-500" />}
                      label="Builder"
                      value={
                        clan.clanBuilderBasePoints?.toLocaleString() ?? "0"
                      }
                    />
                    <MiniStat
                      icon={<Swords className="h-4 w-4 text-red-500" />}
                      label="War Wins"
                      value={`${clan.warWins ?? 0}`}
                    />
                    <MiniStat
                      icon={<Star className="h-4 w-4 text-amber-400" />}
                      label="Win Streak"
                      value={`${clan.warWinStreak ?? 0}`}
                    />
                    {clan.warLeague && (
                      <MiniStat
                        icon={
                          clan.warLeague.iconUrls?.small ? (
                            <img
                              src={clan.warLeague.iconUrls.small}
                              alt=""
                              className="h-4 w-4"
                            />
                          ) : (
                            <Crown className="h-4 w-4 text-purple-500" />
                          )
                        }
                        label="War League"
                        value={clan.warLeague.name}
                      />
                    )}
                    {clan.capitalLeague && (
                      <MiniStat
                        icon={
                          clan.capitalLeague.iconUrls?.small ? (
                            <img
                              src={clan.capitalLeague.iconUrls.small}
                              alt=""
                              className="h-4 w-4"
                            />
                          ) : (
                            <Shield className="h-4 w-4 text-cyan-500" />
                          )
                        }
                        label="Capital"
                        value={clan.capitalLeague.name}
                      />
                    )}
                    {clan.location && (
                      <MiniStat
                        icon={
                          <MapPin className="h-4 w-4 text-emerald-500" />
                        }
                        label="Location"
                        value={clan.location.name}
                      />
                    )}
                  </div>

                  {/* Labels */}
                  {clan.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {clan.labels.map((l) => (
                        <span
                          key={l.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/80 text-xs font-medium border border-border/50"
                        >
                          {l.iconUrls?.small && (
                            <img
                              src={l.iconUrls.small}
                              alt=""
                              className="h-4 w-4"
                            />
                          )}
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {desc && (
                    <div>
                      <p
                        className={`text-sm text-muted-foreground leading-relaxed ${
                          !descExpanded && descLong ? "line-clamp-2" : ""
                        }`}
                      >
                        {desc}
                      </p>
                      {descLong && (
                        <button
                          onClick={() => setDescExpanded(!descExpanded)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 mt-1.5 font-medium"
                        >
                          {descExpanded ? (
                            <>
                              Show less <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Show more <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════
              SEARCH + SORT
              ══════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-secondary/50 border-border/50 focus-visible:bg-background transition-colors"
              />
            </div>
            <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border/50">
              {(
                [
                  ["trophies", "🏆"],
                  ["role", "👑"],
                  ["townHall", "🏠"],
                ] as const
              ).map(([key, emoji]) => (
                <button
                  key={key}
                  className={`h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                    sortBy === key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-background/60"
                  }`}
                  onClick={() => setSortBy(key)}
                  title={`Sort by ${key}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            MEMBER LIST
            ══════════════════════════════════════════════════ */}
        <div className="px-4 space-y-1.5 pb-6">
          {filtered.map((m, i) => {
            const displayRank = i + 1;
            const rankDelta =
              m.previousClanRank && m.clanRank
                ? m.previousClanRank - m.clanRank
                : 0;

            return (
              <motion.div
                key={m.tag}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
              >
                <button
                  onClick={() => navigateToPlayer(m.tag)}
                  className="w-full text-left group"
                >
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden group-active:scale-[0.99]">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        {/* Rank */}
                        <div className="w-7 text-center shrink-0">
                          <span className="text-sm font-bold text-muted-foreground">
                            {displayRank}
                          </span>
                        </div>

                        {/* TH icon */}
                        <TownHallIcon level={m.townHallLevel} size={36} />

                        {/* League icon */}
                        <div className="h-7 w-7 shrink-0 flex items-center justify-center">
                          {m.league?.iconUrls?.tiny ||
                          m.league?.iconUrls?.small ? (
                            <img
                              src={
                                m.league.iconUrls.tiny ??
                                m.league.iconUrls.small!
                              }
                              alt={m.league.name}
                              className="h-7 w-7"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <Trophy className="h-3 w-3 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {/* Name + Role + TH info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm truncate">
                              {m.name}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                                ROLE_STYLE[m.role] || ROLE_STYLE.member
                              }`}
                            >
                              {ROLE_LABEL[m.role] || m.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium">
                              TH{m.townHallLevel}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Trophy className="h-3 w-3 text-yellow-500" />
                              {m.trophies.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Donations */}
                        <div className="text-right shrink-0 space-y-0.5">
                          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-0.5">
                            <ArrowUp className="h-2.5 w-2.5" />
                            {m.donations.toLocaleString()}
                          </div>
                          <div className="text-xs text-red-500/80 flex items-center justify-end gap-0.5">
                            <ArrowDown className="h-2.5 w-2.5" />
                            {m.donationsReceived.toLocaleString()}
                          </div>
                        </div>

                        {/* Rank movement */}
                        <div className="w-5 shrink-0 flex items-center justify-center">
                          {rankDelta > 0 && (
                            <div className="flex flex-col items-center">
                              <ArrowUp className="h-3 w-3 text-emerald-500" />
                              <span className="text-[8px] text-emerald-500 font-bold">
                                {rankDelta}
                              </span>
                            </div>
                          )}
                          {rankDelta < 0 && (
                            <div className="flex flex-col items-center">
                              <ArrowDown className="h-3 w-3 text-red-500" />
                              <span className="text-[8px] text-red-500 font-bold">
                                {Math.abs(rankDelta)}
                              </span>
                            </div>
                          )}
                          {rankDelta === 0 && m.previousClanRank > 0 && (
                            <Minus className="h-3 w-3 text-muted-foreground/40" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            );
          })}

          {filtered.length === 0 && members.length > 0 && (
            <div className="text-center py-12">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No members match &ldquo;{search}&rdquo;
              </p>
            </div>
          )}

          {/* Fan Content Disclaimer */}
          <div className="pt-6 pb-2">
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
    </div>
  );
}

// ── Stat sub-component ──────────────────────────────────────────────
function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2 border border-border/30">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-none">
          {label}
        </p>
        <p className="text-xs font-semibold truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}
