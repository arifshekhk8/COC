"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CocClan, CocClanMember } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Trophy,
  Swords,
  Crown,
  ArrowUpDown,
  Search,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Hammer,
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

const ROLE_COLOR: Record<string, string> = {
  leader: "text-yellow-500",
  coLeader: "text-purple-500",
  admin: "text-blue-500",
  elder: "text-blue-500",
  member: "text-muted-foreground",
};

type SortKey = "trophies" | "role" | "townHall";

export default function ClanPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("trophies");
  const [descExpanded, setDescExpanded] = useState(false);

  // Fetch clan info
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

  // Fetch members
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

  // Filter + sort members
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
    // Strip '#' for URL safety, encode the rest
    const encoded = encodeURIComponent(tag.replace("#", ""));
    router.push(`/clan/member/${encoded}`);
  };

  if (clanLoading || membersLoading) {
    return (
      <div className="p-4 space-y-4">
        {/* Skeleton header */}
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-6 bg-muted rounded w-1/2" />
        </div>
        {/* Skeleton members */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (clanError || membersError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Shield className="h-16 w-16 text-destructive/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load clan data</h2>
        <p className="text-muted-foreground mb-4">
          {(clanError as Error)?.message || "Unknown error"}
        </p>
        <Button onClick={handleRefresh}>Retry</Button>
      </div>
    );
  }

  const desc = clan?.description || "";
  const descShort = desc.length > 100;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-2">
        {/* ── Clan Header ───────────────────────────────────── */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Clan</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {clan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Top row: badge + name */}
                  <div className="flex items-center gap-3">
                    {clan.badgeUrls?.medium && (
                      <img
                        src={clan.badgeUrls.medium}
                        alt="Clan badge"
                        className="h-16 w-16"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold truncate">
                        {clan.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {clan.tag}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="font-medium">
                          Lv.{clan.clanLevel}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {clan.members}/50
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <StatItem
                      icon={<Trophy className="h-3.5 w-3.5 text-yellow-500" />}
                      label="Trophies"
                      value={clan.clanPoints?.toLocaleString()}
                    />
                    <StatItem
                      icon={<Hammer className="h-3.5 w-3.5 text-orange-500" />}
                      label="Builder"
                      value={clan.clanBuilderBasePoints?.toLocaleString()}
                    />
                    <StatItem
                      icon={<Swords className="h-3.5 w-3.5 text-red-500" />}
                      label="War Wins"
                      value={`${clan.warWins ?? 0}`}
                    />
                    <StatItem
                      icon={<Star className="h-3.5 w-3.5 text-amber-500" />}
                      label="Win Streak"
                      value={`${clan.warWinStreak ?? 0}`}
                    />
                    {clan.warLeague && (
                      <StatItem
                        icon={
                          <Crown className="h-3.5 w-3.5 text-purple-500" />
                        }
                        label="War League"
                        value={clan.warLeague.name}
                      />
                    )}
                    {clan.capitalLeague && (
                      <StatItem
                        icon={
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                        }
                        label="Capital"
                        value={clan.capitalLeague.name}
                      />
                    )}
                    {clan.location && (
                      <StatItem
                        icon={
                          <MapPin className="h-3.5 w-3.5 text-green-500" />
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
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs"
                        >
                          {l.iconUrls?.small && (
                            <img
                              src={l.iconUrls.small}
                              alt=""
                              className="h-3.5 w-3.5"
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
                        className={`text-sm text-muted-foreground ${
                          !descExpanded && descShort ? "line-clamp-2" : ""
                        }`}
                      >
                        {desc}
                      </p>
                      {descShort && (
                        <button
                          onClick={() => setDescExpanded(!descExpanded)}
                          className="text-xs text-primary flex items-center gap-0.5 mt-1"
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

          {/* ── Search + Sort ─────────────────────────────── */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <div className="flex gap-1">
              {(
                [
                  ["trophies", "🏆"],
                  ["role", "👑"],
                  ["townHall", "🏠"],
                ] as const
              ).map(([key, emoji]) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  className="h-9 px-2.5 text-xs"
                  onClick={() => setSortBy(key)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Member List ─────────────────────────────────── */}
        <div className="px-4 space-y-1.5 pb-4">
          {filtered.map((m, i) => (
            <motion.div
              key={m.tag}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <button
                onClick={() => navigateToPlayer(m.tag)}
                className="w-full text-left"
              >
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    {/* Rank */}
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                      {m.clanRank}
                    </span>

                    {/* League icon */}
                    <div className="h-8 w-8 shrink-0 flex items-center justify-center">
                      {m.league?.iconUrls?.tiny ? (
                        <img
                          src={m.league.iconUrls.tiny}
                          alt={m.league.name}
                          className="h-7 w-7"
                        />
                      ) : (
                        <Trophy className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">
                          {m.name}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            ROLE_COLOR[m.role] || "text-muted-foreground"
                          }`}
                        >
                          {ROLE_LABEL[m.role] || m.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>TH{m.townHallLevel}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          {m.trophies.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Donations */}
                    <div className="text-right shrink-0">
                      <div className="text-xs text-green-600 font-medium">
                        ↑{m.donations}
                      </div>
                      <div className="text-xs text-red-500">
                        ↓{m.donationsReceived}
                      </div>
                    </div>

                    {/* Rank change indicator */}
                    <div className="w-4 shrink-0">
                      {m.previousClanRank > m.clanRank && (
                        <ArrowUpDown className="h-3.5 w-3.5 text-green-500" />
                      )}
                      {m.previousClanRank < m.clanRank && (
                        <ArrowUpDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}

          {filtered.length === 0 && members.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No members match &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small stat component ─────────────────────────────────────────────
function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
