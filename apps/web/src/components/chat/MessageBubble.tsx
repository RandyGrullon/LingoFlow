"use client";

import { motion } from "framer-motion";
import type { CorrectionItem } from "@lingoflow/shared-types";

export function MessageBubble(props: {
  role: "user" | "assistant";
  content: string;
  corrections?: CorrectionItem[] | null;
}) {
  const isUser = props.role === "user";
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow ${
          isUser
            ? "bg-brand text-white"
            : "bg-slate-800 text-slate-100 dark:bg-slate-200 dark:text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{props.content}</p>
        {!isUser && props.corrections && props.corrections.length > 0 && (
          <ul className="mt-2 border-t border-white/20 pt-2 text-xs opacity-90">
            {props.corrections.map((c, i) => (
              <li key={i}>
                <span className="font-semibold">{c.original}</span> → {c.suggestion}
                {c.explanation_in_native ? (
                  <span className="block text-[11px] opacity-80">
                    {c.explanation_in_native}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
