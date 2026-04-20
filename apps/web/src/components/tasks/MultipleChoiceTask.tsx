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
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    props.onSubmit(selected);
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">{props.question}</p>
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
                ? "border-brand bg-brand/20"
                : "border-slate-600 hover:bg-slate-800/40 dark:border-slate-300"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      <button
        type="button"
        disabled={selected === null || done || props.disabled}
        onClick={submit}
        className="w-full rounded-2xl bg-brand py-3 font-semibold text-white disabled:opacity-40"
      >
        Comprobar
      </button>
    </div>
  );
}
