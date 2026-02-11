"use client";

import { Newspaper } from "lucide-react";

export default function FeedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Newspaper className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-xl font-bold mb-2">Clan Feed</h2>
      <p className="text-muted-foreground max-w-xs">
        Activity feed coming soon. See who joined, donated troops, and started wars.
      </p>
    </div>
  );
}
