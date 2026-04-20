"use client";

import { motion } from "framer-motion";
import { VoiceInputButton } from "@/components/chat/VoiceInputButton";

export function VoiceTask(props: {
  promptToSay: string;
  speechLang: string;
  onSubmit: (said: string) => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        Di en voz alta:
      </p>
      <p className="rounded-xl border border-primary/20 bg-white/90 p-4 text-center text-xl text-slate-900 shadow-inner dark:bg-surface-card dark:text-white">
        {props.promptToSay}
      </p>
      <VoiceInputButton
        lang={props.speechLang}
        disabled={props.disabled}
        onFinal={(t) => props.onSubmit(t)}
      />
    </motion.div>
  );
}
