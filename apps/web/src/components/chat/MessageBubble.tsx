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
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
          isUser
            ? "bg-primary text-primary-foreground shadow-primary/20"
            : "border border-primary/10 bg-white text-slate-900 shadow-black/5 dark:border-primary/20 dark:bg-surface-card dark:text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap">{props.content}</p>
        {!isUser && props.corrections && props.corrections.length > 0 && (
          <ul className="mt-2 border-t border-primary/15 pt-2 text-xs opacity-90 dark:border-primary/25">
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
