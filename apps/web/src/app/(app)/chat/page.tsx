"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChatNewPage() {
  const { accessToken, loading } = useAuth();
  const [convId, setConvId] = useState<string | null>(null);
  const router = useRouter();

  if (loading || !accessToken) {
    return <p className="p-4">Cargando sesión…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Chat</h1>
      <ChatWindow
        token={accessToken}
        conversationId={convId}
        onConversationId={(id) => {
          setConvId(id);
          router.replace(`/chat/${id}`);
        }}
        speechLang="en-US"
        targetLangForTts="en-US"
      />
    </div>
  );
}
