"use client";

import { Activity } from "lucide-react";

export default function StatusPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Activity className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-xl font-bold mb-2">Member Status</h2>
      <p className="text-muted-foreground max-w-xs">
        Track heroes, troops, and defense levels for all clan members. Coming soon.
      </p>
    </div>
  );
}
