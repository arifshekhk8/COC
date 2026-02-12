/**
 * CoC Asset Resolver
 *
 * Maps unit names to local icon paths under /coc-assets/.
 * Uses a normalization strategy: lowercase, trim, replace spaces with hyphens.
 * Falls back to a placeholder SVG if a specific icon is missing.
 */

export type AssetCategory =
  | "heroes"
  | "troops"
  | "spells"
  | "pets"
  | "equipment"
  | "townhalls"
  | "builderhalls"
  | "misc";

/** Normalize a CoC unit name to a filename-safe slug */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get the local asset path for a CoC unit.
 * Returns `/coc-assets/<category>/<slug>.png`
 */
export function getCocAsset(category: AssetCategory, name: string): string {
  const slug = slugify(name);
  return `/coc-assets/${category}/${slug}.png`;
}

/** Town Hall icon by level */
export function getTownHallAsset(level: number): string {
  return `/coc-assets/townhalls/townhall-${level}.png`;
}

/** Builder Hall icon by level */
export function getBuilderHallAsset(level: number): string {
  return `/coc-assets/builderhalls/builderhall-${level}.png`;
}

/** Fallback placeholder */
export const PLACEHOLDER_ICON = "/coc-assets/misc/placeholder.png";

/**
 * React-friendly image error handler: swap src to placeholder.
 * Usage: <img onError={onAssetError} ... />
 */
export function onAssetError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (!img.src.endsWith("placeholder.png")) {
    img.src = PLACEHOLDER_ICON;
  }
}
