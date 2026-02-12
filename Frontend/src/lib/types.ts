export interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface ChatChannel {
  id: number;
  name: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  channel: number;
  sender: number;
  sender_username: string;
  text: string;
  attachment?: string | null;
  created_at: string;
}

export interface WsChatMessage {
  id: number;
  text: string;
  sender: { id: number; username: string };
  created_at: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// ── Clash of Clans API types ─────────────────────────────────────────

export interface CocBadgeUrls {
  small: string;
  medium: string;
  large: string;
}

export interface CocLeague {
  id: number;
  name: string;
  iconUrls?: { small?: string; medium?: string; tiny?: string };
}

export interface CocLabel {
  id: number;
  name: string;
  iconUrls?: { small?: string; medium?: string };
}

export interface CocLocation {
  id: number;
  name: string;
  isCountry: boolean;
  countryCode?: string;
}

export interface CocClan {
  tag: string;
  name: string;
  badgeUrls: CocBadgeUrls;
  type: string;
  description: string;
  location?: CocLocation;
  clanLevel: number;
  members: number;
  clanPoints: number;
  clanBuilderBasePoints: number;
  warLeague?: CocLeague;
  warWins: number;
  warWinStreak: number;
  isWarLogPublic: boolean;
  clanCapital?: Record<string, unknown>;
  capitalLeague?: CocLeague;
  clanCapitalPoints?: number;
  labels: CocLabel[];
  isFamilyFriendly: boolean;
}

export interface CocClanMember {
  name: string;
  tag: string;
  role: string;
  expLevel: number;
  townHallLevel: number;
  league?: CocLeague;
  builderBaseLeague?: CocLeague;
  trophies: number;
  builderBaseTrophies: number;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
}

export interface CocHero {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
  superTroopIsActive?: boolean;
}

export interface CocTroop {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
  superTroopIsActive?: boolean;
}

export interface CocSpell {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
}

export interface CocEquipment {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
}

export interface CocAchievement {
  name: string;
  stars: number;
  value: number;
  target: number;
  info: string;
  completionInfo?: string;
  village: string;
}

export interface CocPlayer {
  tag: string;
  name: string;
  townHallLevel: number;
  townHallWeaponLevel?: number;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  bestBuilderBaseTrophies?: number;
  league?: CocLeague;
  builderBaseLeague?: CocLeague;
  clan?: { tag: string; name: string; clanLevel: number; badgeUrls: CocBadgeUrls };
  role?: string;
  warPreference?: string;
  donations: number;
  donationsReceived: number;
  clanCapitalContributions?: number;
  labels: CocLabel[];
  heroes: CocHero[];
  troops: CocTroop[];
  spells: CocSpell[];
  heroEquipment: CocEquipment[];
  legendStatistics?: Record<string, unknown>;
  achievements: CocAchievement[];
}
