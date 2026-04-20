"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function PdfWorksheetTask(props: {
  worksheetUrl: string;
  onUploaded: (file: File) => void;
  disabled?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <a
        href={props.worksheetUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-90"
      >
        Descargar PDF
      </a>
      <p className="text-sm text-muted-fg">
        Completa el PDF y súbelo aquí para evaluación automática.
      </p>
      <input
        type="file"
        accept="application/pdf"
        disabled={props.disabled}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground dark:text-slate-200"
      />
      <motion.button
        type="button"
        disabled={!file || props.disabled}
        whileTap={{ scale: 0.99 }}
        onClick={() => file && props.onUploaded(file)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 font-semibold text-white shadow-md dark:border-slate-500 dark:bg-surface-card dark:text-white"
      >
        Subir y evaluar
      </motion.button>
    </motion.div>
  );
}
