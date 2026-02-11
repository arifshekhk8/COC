"use client";

import { Swords } from "lucide-react";

export default function WarPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Swords className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-xl font-bold mb-2">Clan War</h2>
      <p className="text-muted-foreground max-w-xs">
        War opt-in, war map, and attack tracking. Coming soon.
      </p>
    </div>
  );
}
