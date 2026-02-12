"use client";

import { useState } from "react";
import {
  getCocAsset,
  getTownHallAsset,
  type AssetCategory,
} from "@/lib/coc-assets";

interface CocIconProps {
  category: AssetCategory;
  name: string;
  size?: number;
  className?: string;
}

/**
 * Renders a CoC unit icon with fallback.
 * Shows the icon image if available, otherwise an initial-based badge.
 */
export function CocIcon({ category, name, size = 40, className = "" }: CocIconProps) {
  const [failed, setFailed] = useState(false);
  const src = getCocAsset(category, name);

  if (failed) {
    return <CocInitialBadge name={name} size={size} className={className} />;
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

interface TownHallIconProps {
  level: number;
  size?: number;
  className?: string;
}

export function TownHallIcon({ level, size = 32, className = "" }: TownHallIconProps) {
  const [failed, setFailed] = useState(false);
  const src = getTownHallAsset(level);

  if (failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md font-bold text-white shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.35,
          background: getTHGradient(level),
        }}
      >
        {level}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`TH${level}`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

function CocInitialBadge({
  name,
  size,
  className,
}: {
  name: string;
  size: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hue = hashCode(name) % 360;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-bold text-white shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
      }}
      title={name}
    >
      {initials}
    </span>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getTHGradient(level: number): string {
  if (level >= 16) return "linear-gradient(135deg, #7c3aed, #4f46e5)";
  if (level >= 14) return "linear-gradient(135deg, #0ea5e9, #3b82f6)";
  if (level >= 12) return "linear-gradient(135deg, #f59e0b, #ef4444)";
  if (level >= 10) return "linear-gradient(135deg, #ef4444, #dc2626)";
  if (level >= 8) return "linear-gradient(135deg, #6b7280, #374151)";
  if (level >= 6) return "linear-gradient(135deg, #f59e0b, #d97706)";
  return "linear-gradient(135deg, #78716c, #57534e)";
}
