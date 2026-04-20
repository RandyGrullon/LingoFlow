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
      <p className="font-semibold">{props.topic}</p>
      <p className="text-xs text-slate-500">
        Palabras: {words} (objetivo {props.minWords}–{props.maxWords})
      </p>
      <textarea
        className="min-h-[140px] w-full rounded-xl border border-slate-600 bg-transparent p-3 text-sm dark:border-slate-300"
        value={text}
        disabled={props.disabled}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="button"
        disabled={props.disabled || words < props.minWords}
        onClick={() => props.onSubmit(text)}
        className="w-full rounded-2xl bg-brand py-3 font-semibold text-white disabled:opacity-40"
      >
        Enviar
      </button>
    </motion.div>
  );
}
