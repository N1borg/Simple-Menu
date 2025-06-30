import { useDraggable } from '@dnd-kit/core';
import React from 'react';

export function SortableHandle({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <span
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="dnd-handle flex items-center justify-center cursor-grab touch-none rounded p-1 hover:bg-gray-200 active:bg-gray-300 focus:outline-none"
      tabIndex={0}
      aria-label="Déplacer"
      style={{ touchAction: 'none', opacity: isDragging ? 0.5 : 1 }}
    >
      {children}
    </span>
  );
}
