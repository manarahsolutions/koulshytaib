"use client";

import { useState, type DragEvent } from "react";
import { cn } from "@/lib/utils/cn";

export type UseSortableDragOptions = {
  disabled?: boolean;
  onDropReorder: (sourceId: string, targetId: string) => void;
};

/**
 * HTML5 drag-and-drop state for reordering admin list rows/cards.
 */
export function useSortableDrag({
  disabled = false,
  onDropReorder,
}: UseSortableDragOptions) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const clear = () => {
    setDragId(null);
    setOverId(null);
  };

  const finishDrop = (sourceId: string, targetId: string) => {
    clear();
    if (sourceId && targetId && sourceId !== targetId) {
      onDropReorder(sourceId, targetId);
    }
  };

  const itemProps = (id: string) => ({
    draggable: !disabled,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      if (disabled) return;
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    },
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (overId !== id) setOverId(id);
    },
    onDragLeave: () => {
      if (overId === id) setOverId(null);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (disabled) return;
      const sourceId = dragId ?? e.dataTransfer.getData("text/plain");
      if (sourceId) finishDrop(sourceId, id);
    },
    onDragEnd: () => {
      clear();
    },
    className: cn(
      dragId === id && "opacity-50",
      overId === id && dragId && dragId !== id && "bg-brand-primary/8",
    ),
  });

  const cardClassName = (id: string, base?: string) =>
    cn(
      base,
      dragId === id && "opacity-50",
      overId === id &&
        dragId &&
        dragId !== id &&
        "border-brand-primary",
    );

  return { dragId, overId, itemProps, cardClassName, clear };
}
