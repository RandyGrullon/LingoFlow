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
      <span className="text-xs text-muted-fg">
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
      className={`rounded-full px-4 py-2 text-sm font-medium shadow-md transition-colors ${
        listening
          ? "bg-rose-600 text-white shadow-rose-500/30"
          : "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary-dark"
      } disabled:opacity-50`}
    >
      {listening ? "Detener" : "Hablar"}
    </motion.button>
  );
}
