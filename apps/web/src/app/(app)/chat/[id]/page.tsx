"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAuth } from "@/providers/AuthProvider";
import { useParams } from "next/navigation";

export default function ChatByIdPage() {
  const params = useParams<{ id: string }>();
  const { accessToken, loading } = useAuth();

  if (loading || !accessToken) {
    return <p className="p-4">Cargando sesión…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Chat</h1>
      <ChatWindow
        token={accessToken}
        conversationId={params.id}
        onConversationId={() => {
          /* noop — already routed */
        }}
        speechLang="en-US"
        targetLangForTts="en-US"
      />
    </div>
  );
}
