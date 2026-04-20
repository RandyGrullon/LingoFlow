"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface MatchPairsColumnItem {
  id: string;
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchPairsTask(props: {
  instruction: string;
  left: MatchPairsColumnItem[];
  right: MatchPairsColumnItem[];
  onSubmit: (answer: { matches: Record<string, string> }) => void;
  disabled?: boolean;
}) {
  const rightShuffled = useMemo(
    () => shuffle(props.right),
    [props.right],
  );

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shakeLeft, setShakeLeft] = useState<string | null>(null);
  const selectedLeftRef = useRef<string | null>(null);

  const pairLeft = useCallback(
    (leftId: string, rightId: string) => {
      setMatches((m) => {
        const next = { ...m };
        for (const [l, r] of Object.entries(next)) {
          if (r === rightId) delete next[l];
        }
        next[leftId] = rightId;
        return next;
      });
      setSelectedLeft(null);
    },
    [],
  );

  const onLeftClick = useCallback(
    (id: string) => {
      if (props.disabled) return;
      setSelectedLeft(id);
    },
    [props.disabled],
  );

  const onRightClick = (rightId: string) => {
    if (props.disabled || !selectedLeft) return;
    pairLeft(selectedLeft, rightId);
  };

  useEffect(() => {
    selectedLeftRef.current = selectedLeft;
  }, [selectedLeft]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (props.disabled) return;
      const lk = props.left;
      const rk = rightShuffled;
      const n = Math.min(lk.length, 9);
      if (e.key >= "1" && e.key <= String(n)) {
        const idx = parseInt(e.key, 10) - 1;
        if (lk[idx]) onLeftClick(lk[idx].id);
        return;
      }
      const rightKeyMap: Record<string, number> = {
        "6": 0,
        "7": 1,
        "8": 2,
        "9": 3,
        "0": 4,
      };
      if (e.key in rightKeyMap) {
        const idx = rightKeyMap[e.key];
        const left = selectedLeftRef.current;
        if (left && rk[idx]) pairLeft(left, rk[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.disabled, props.left, rightShuffled, pairLeft, onLeftClick]);

  const allPaired =
    props.left.length > 0 &&
    props.left.every((l) => matches[l.id] !== undefined);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
        {props.instruction}
      </h2>
      <p className="text-xs text-slate-500">
        Atajo: 1–{Math.min(props.left.length, 9)} columna izquierda; 6–9 y 0
        columna derecha (hasta 5 pares).
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-400">Izquierda</p>
          {props.left.map((item, i) => {
            const paired = matches[item.id];
            const active = selectedLeft === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                layout
                disabled={props.disabled}
                onClick={() => onLeftClick(item.id)}
                animate={
                  shakeLeft === item.id
                    ? { x: [0, -6, 6, -6, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.35 }}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm shadow-sm transition ${
                  paired
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : active
                      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-300 dark:bg-sky-950/40"
                      : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                  {i + 1}
                </span>
                <span>{item.text}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-400">Derecha</p>
          {rightShuffled.map((item, i) => {
            const usedBy = Object.entries(matches).find(
              ([, r]) => r === item.id,
            )?.[0];
            const labels = ["6", "7", "8", "9", "0"];
            const keyHint = i < 5 ? labels[i] : "";
            return (
              <motion.button
                key={item.id}
                type="button"
                layout
                disabled={props.disabled}
                onClick={() => onRightClick(item.id)}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm shadow-sm transition ${
                  usedBy
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                  {keyHint || "·"}
                </span>
                <span>{item.text}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {selectedLeft ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-sky-600"
          >
            Elige la pareja en la columna derecha.
          </motion.p>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        disabled={props.disabled || !allPaired}
        onClick={() => {
          if (!allPaired) {
            const missing = props.left.find((l) => !matches[l.id]);
            if (missing) {
              setShakeLeft(missing.id);
              setTimeout(() => setShakeLeft(null), 400);
            }
            return;
          }
          props.onSubmit({ matches });
        }}
        whileHover={{ scale: allPaired ? 1.01 : 1 }}
        className="w-full rounded-2xl bg-slate-200 py-4 text-base font-bold text-slate-700 shadow-inner transition enabled:bg-orange-400 enabled:text-white enabled:shadow-md dark:bg-slate-700 dark:text-slate-200 enabled:dark:bg-orange-500"
      >
        Comprobar
      </motion.button>
    </div>
  );
}
