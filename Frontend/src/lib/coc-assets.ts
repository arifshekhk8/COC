/**
 * CoC Asset Resolver
 *
 * Resolves CoC unit names to icon URLs from the coc.guide CDN.
 * Uses a name→slug mapping for units whose CDN slugs don't match
 * a simple slugify of their API display names, with fallback to
 * colored initial badges in the CocIcon component.
 */

const CDN = "https://coc.guide/static/imgs";

export type AssetCategory =
  | "heroes"
  | "troops"
  | "spells"
  | "pets"
  | "equipment";

/** CDN category path segment (singular form used by coc.guide) */
const CDN_CATEGORY: Record<AssetCategory, string> = {
  heroes: "hero",
  troops: "troop",
  spells: "spell",
  pets: "pet",
  equipment: "equipment",
};

// ──────────────────────────────────────────────────────────
// Name → CDN slug mapping for units that DON'T match simple
// slugify. Keys are LOWER-CASED API display names.
// ──────────────────────────────────────────────────────────

const SLUG_OVERRIDES: Record<string, string> = {
  // ── Heroes ─────────────────────────────────────────────
  "royal champion": "royal-champion",
  "minion prince": "minion-hero",

  // ── Troops (Home Village) ──────────────────────────────
  "p.e.k.k.a": "pekka",
  "baby dragon": "babydragon",
  "lava hound": "airdefenceseeker",
  "witch": "warlock",
  "valkyrie": "warrior-girl",
  "minion": "gargoyle",
  "hog rider": "boar-rider",
  "battle ram": "battleram",
  "inferno dragon": "infernodragon",
  "druid": "druid_healer",
  "m.e.c.h.a": "elprimo",
  "c.o.o.k.i.e": "cookie",
  "broom witch": "courier",

  // ── Super Troops ───────────────────────────────────────
  "super barbarian": "elitebarbarian",
  "super archer": "elitearcher",
  "sneaky goblin": "elitegoblin",
  "super giant": "elitegiant",
  "super valkyrie": "elitevalkyrie",
  "super wall breaker": "elitewallbreaker",
  "super witch": "head-witch",
  "rocket balloon": "hastyballoon",
  "ice hound": "ice-hound",

  // ── Siege Machines ─────────────────────────────────────
  "wall wrecker": "siege-machine-ram",
  "battle blimp": "siege-machine-flyer",
  "stone slammer": "siege-bowler-balloon",
  "siege barracks": "siege-machine-carrier",
  "log launcher": "siege-log-launcher",
  "flame flinger": "siege-catapult",

  // ── Builder Base Troops ────────────────────────────────
  "sneaky archer": "archer2",
  "raged barbarian": "barbarian2",
  "boxer giant": "giant2",
  "beta minion": "gargoyle2",
  "bomber": "bomber2",
  "night witch": "dark-witch",
  "drop ship": "balloon2",
  "power p.e.k.k.a": "pekka2",
  "cannon cart": "moving-cannon",

  // ── Spells ─────────────────────────────────────────────
  "lightning spell": "lighningstorm",
  "healing spell": "healingwave",
  "rage spell": "haste",
  "haste spell": "speedup",
  "clone spell": "duplicate",
  "earthquake spell": "earthquake",
  "freeze spell": "freeze",
  "poison spell": "poison",
  "jump spell": "jump",
  "invisibility spell": "invisibility",
  "recall spell": "recall",
  "overgrowth spell": "overgrowth",
  "bat spell": "spawnbats",
  "skeleton spell": "spawnskele",
  "revive spell": "revive",

  // ── Pets ───────────────────────────────────────────────
  "l.a.s.s.i": "barky",
  "mighty yak": "bulldozer",
  "electro owl": "electrowl",
  "spirit fox": "phase-fennec",

  // ── Equipment ──────────────────────────────────────────
  "rage gem": "angry-tome",
  "archer puppet": "archer-crown",
  "barbarian puppet": "barbarian-crown",
  "fireball": "fire-in-a-can",
};

/** Normalize a CoC unit name to a URL-safe slug */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[.']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get the CDN URL for a CoC unit icon.
 * Checks the override map first, then falls back to slugify.
 */
export function getCocAsset(category: AssetCategory, name: string): string {
  const key = name.toLowerCase().trim();
  const slug = SLUG_OVERRIDES[key] ?? slugify(name);
  const cdnCat = CDN_CATEGORY[category];
  return `${CDN}/${cdnCat}/${slug}.png`;
}

/** Town Hall icon by level */
export function getTownHallAsset(level: number): string {
  return `${CDN}/other/town-hall-${level}.png`;
}

/** Builder Hall icon by level */
export function getBuilderHallAsset(level: number): string {
  return `${CDN}/other/builder-hall-${level}.png`;
}
