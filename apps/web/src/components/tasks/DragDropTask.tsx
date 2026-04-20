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
      className={`rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm dark:border-slate-300 ${
        isDragging ? "opacity-70" : ""
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
      className={`min-h-[48px] rounded-xl border-2 border-dashed px-3 py-2 text-sm ${
        isOver ? "border-brand" : "border-slate-500"
      }`}
    >
      <span className="block text-xs text-slate-500">{props.label}</span>
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
      <p className="text-sm text-slate-500">
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
      <button
        type="button"
        disabled={props.disabled}
        onClick={submit}
        className="w-full rounded-2xl bg-brand py-3 font-semibold text-white disabled:opacity-40"
      >
        Enviar
      </button>
    </div>
  );
}
