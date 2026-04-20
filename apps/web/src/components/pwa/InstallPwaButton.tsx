"use client";

import { useEffect, useState } from "react";

export function InstallPwaButton() {
  const [deferred, setDeferred] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <button
      type="button"
      className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-white dark:bg-slate-200 dark:text-slate-900"
      onClick={async () => {
        await deferred.prompt();
        setVisible(false);
        setDeferred(null);
      }}
    >
      Instalar app
    </button>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
