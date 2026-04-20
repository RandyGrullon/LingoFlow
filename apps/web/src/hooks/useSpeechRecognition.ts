"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSpeechRecognitionOptions {
  lang: string;
  onResult?: (text: string, isFinal: boolean) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const r = new SR();
    r.lang = options.lang;
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const text = last[0]?.transcript ?? "";
      options.onResult?.(text, last.isFinal);
    };
    r.onerror = () => setError("Speech recognition error");
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    return () => {
      try {
        r.abort();
      } catch {
        /* ignore */
      }
    };
  }, [options.lang, options.onResult]);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    setError(null);
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { supported, listening, error, start, stop };
}
