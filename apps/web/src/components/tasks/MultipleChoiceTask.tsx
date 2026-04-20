"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useState } from "react";

export function MultipleChoiceTask(props: {
  question: string;
  options: string[];
  onSubmit: (index: number) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function submit() {
    if (selected === null || done) return;
    setDone(true);
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.72 },
      colors: ["#2563eb", "#60a5fa", "#93c5fd", "#ffffff"],
    });
    props.onSubmit(selected);
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        {props.question}
      </p>
      <div className="grid gap-2">
        {props.options.map((opt, i) => (
          <motion.button
            key={i}
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={props.disabled || done}
            onClick={() => setSelected(i)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              selected === i
                ? "border-primary bg-primary/15 text-slate-900 shadow-md shadow-primary/10 dark:text-white"
                : "border-slate-300 bg-white/80 text-slate-900 hover:bg-primary/5 dark:border-slate-600 dark:bg-surface-elevated/80 dark:text-slate-100"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      <motion.button
        type="button"
        disabled={selected === null || done || props.disabled}
        onClick={submit}
        whileTap={{ scale: 0.99 }}
        className="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-40"
      >
        Comprobar
      </motion.button>
    </div>
  );
}
