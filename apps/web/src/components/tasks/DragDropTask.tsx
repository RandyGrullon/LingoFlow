"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

function DraggableItem(props: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: props.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      type="button"
      className={`rounded-xl border border-primary/30 bg-surface-elevated/90 px-3 py-2 text-sm text-slate-900 shadow-sm dark:text-slate-100 ${
        isDragging ? "opacity-70 ring-2 ring-primary/40" : ""
      }`}
    >
      {props.label}
    </button>
  );
}

function DroppableSlot(props: { id: string; label: string; filled?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: props.id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[48px] rounded-xl border-2 border-dashed px-3 py-2 text-sm text-slate-800 transition-colors dark:text-slate-200 ${
        isOver ? "border-primary bg-primary/10" : "border-slate-400 dark:border-slate-500"
      }`}
    >
      <span className="block text-xs text-muted-fg">{props.label}</span>
      {props.filled ?? "—"}
    </div>
  );
}

export function DragDropTask(props: {
  items: string[];
  targets: string[];
  mapping: Record<string, string>;
  onSubmit: (userMapping: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const itemIds = useMemo(
    () => props.items.map((_, i) => `item-${i}`),
    [props.items],
  );
  const targetIds = useMemo(
    () => props.targets.map((_, i) => `target-${i}`),
    [props.targets],
  );
  const [assignment, setAssignment] = useState<Record<string, string>>({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const active = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over || !over.startsWith("target-")) return;
    const itemIdx = itemIds.indexOf(active);
    if (itemIdx < 0) return;
    const label = props.items[itemIdx];
    setAssignment((m) => ({ ...m, [over]: label }));
  }

  function submit() {
    const user: Record<string, string> = {};
    targetIds.forEach((tid, i) => {
      const slot = assignment[tid];
      if (slot) user[props.targets[i]] = slot;
    });
    props.onSubmit(user);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-fg">
        Arrastra cada elemento a la categoría correcta.
      </p>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex flex-wrap gap-2">
          {itemIds.map((id, i) => (
            <DraggableItem key={id} id={id} label={props.items[i]} />
          ))}
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {targetIds.map((id, i) => (
            <DroppableSlot
              key={id}
              id={id}
              label={props.targets[i]}
              filled={assignment[id]}
            />
          ))}
        </div>
      </DndContext>
      <motion.button
        type="button"
        disabled={props.disabled}
        whileTap={{ scale: 0.99 }}
        onClick={submit}
        className="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-40"
      >
        Enviar
      </motion.button>
    </div>
  );
}
