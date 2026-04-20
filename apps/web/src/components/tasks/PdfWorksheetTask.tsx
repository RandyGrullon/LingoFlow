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
        className="inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
      >
        Descargar PDF
      </a>
      <p className="text-sm text-slate-500">
        Completa el PDF y súbelo aquí para evaluación automática.
      </p>
      <input
        type="file"
        accept="application/pdf"
        disabled={props.disabled}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <button
        type="button"
        disabled={!file || props.disabled}
        onClick={() => file && props.onUploaded(file)}
        className="w-full rounded-2xl bg-slate-800 py-3 font-semibold text-white dark:bg-slate-200 dark:text-slate-900"
      >
        Subir y evaluar
      </button>
    </motion.div>
  );
}
