"use client";

import { motion } from "framer-motion";
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
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-lg border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/25 dark:text-primary-muted"
      onClick={async () => {
        await deferred.prompt();
        setVisible(false);
        setDeferred(null);
      }}
    >
      Instalar app
    </motion.button>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
