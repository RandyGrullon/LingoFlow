"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function WritingTask(props: {
  topic: string;
  minWords: number;
  maxWords: number;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <p className="font-semibold text-slate-900 dark:text-white">{props.topic}</p>
      <p className="text-xs text-muted-fg">
        Palabras: {words} (objetivo {props.minWords}–{props.maxWords})
      </p>
      <textarea
        className="min-h-[140px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-inner outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-600 dark:bg-slate-950/50 dark:text-white"
        value={text}
        disabled={props.disabled}
        onChange={(e) => setText(e.target.value)}
      />
      <motion.button
        type="button"
        disabled={props.disabled || words < props.minWords}
        whileTap={{ scale: 0.99 }}
        onClick={() => props.onSubmit(text)}
        className="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-40"
      >
        Enviar
      </motion.button>
    </motion.div>
  );
}
