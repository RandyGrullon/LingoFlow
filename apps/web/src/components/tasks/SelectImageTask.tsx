"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";

export interface SelectImageOptionView {
  id: string;
  caption: string;
  emoji?: string;
  imageUrl?: string;
}

export function SelectImageTask(props: {
  instruction: string;
  wordOrPhrase: string;
  speakLang: string;
  options: SelectImageOptionView[];
  onSubmit: (answer: { optionId: string }) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(props.wordOrPhrase);
    u.lang = props.speakLang;
    window.speechSynthesis.speak(u);
  }, [props.wordOrPhrase, props.speakLang]);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
        {props.instruction}
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={speak}
          disabled={props.disabled}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-2xl text-white shadow-md"
          aria-label="Escuchar"
        >
          🔊
        </motion.button>
        <span className="text-lg text-slate-600 dark:text-slate-300">
          {props.wordOrPhrase}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {props.options.map((opt) => {
          const active = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              layout
              disabled={props.disabled}
              onClick={() => {
                setSelected(opt.id);
              }}
              animate={active ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -2 }}
              className={`flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-3xl border-2 bg-white p-4 text-center shadow-sm dark:bg-slate-900 ${
                active
                  ? "border-orange-400 ring-2 ring-orange-200"
                  : "border-slate-200 dark:border-slate-600"
              }`}
            >
              {opt.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opt.imageUrl}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <span className="text-5xl">{opt.emoji ?? "❔"}</span>
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {opt.caption}
              </span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {!selected ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-slate-500"
          >
            Elige una imagen.
          </motion.p>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        disabled={props.disabled || !selected}
        whileHover={{ scale: selected ? 1.02 : 1 }}
        onClick={() => {
          if (selected) props.onSubmit({ optionId: selected });
        }}
        className="w-full rounded-2xl bg-slate-200 py-4 text-base font-bold text-slate-500 shadow-inner enabled:bg-orange-400 enabled:text-white enabled:shadow-md dark:bg-slate-700 dark:enabled:bg-orange-500"
      >
        Comprobar
      </motion.button>
    </div>
  );
}
