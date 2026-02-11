"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { ChatChannel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus, Hash } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function ChatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newChannelName, setNewChannelName] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: channels = [], isLoading } = useQuery<ChatChannel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat/channels/");
      return data;
    },
  });

  const createChannel = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post("/api/chat/channels/", { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setNewChannelName("");
      setSheetOpen(false);
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Channels
        </h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Create Channel</SheetTitle>
            </SheetHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newChannelName.trim()) {
                  createChannel.mutate(newChannelName.trim());
                }
              }}
              className="flex gap-2 mt-4"
            >
              <Input
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={createChannel.isPending}>
                Create
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </header>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No channels yet. Create one!</p>
          </div>
        ) : (
          channels.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => router.push(`/chat/${ch.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      by {ch.created_by_username}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
