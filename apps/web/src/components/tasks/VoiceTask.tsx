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
      <p className="text-lg font-semibold">Di en voz alta:</p>
      <p className="rounded-xl bg-slate-800/50 p-4 text-center text-xl dark:bg-slate-200/80">
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
