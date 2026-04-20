"use client";

import { motion } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export function VoiceInputButton(props: {
  lang: string;
  onFinal: (text: string) => void;
  disabled?: boolean;
}) {
  const { supported, listening, start, stop } = useSpeechRecognition({
    lang: props.lang,
    onResult: (text, isFinal) => {
      if (isFinal) props.onFinal(text);
    },
  });

  if (!supported) {
    return (
      <span className="text-xs text-slate-500">
        Voz no disponible en este navegador
      </span>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      disabled={props.disabled}
      onClick={() => (listening ? stop() : start())}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        listening
          ? "bg-red-500 text-white"
          : "bg-slate-700 text-white hover:bg-slate-600"
      } disabled:opacity-50`}
    >
      {listening ? "Detener" : "Hablar"}
    </motion.button>
  );
}
