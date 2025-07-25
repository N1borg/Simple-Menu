import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

export function SortableCategory({ id, children }: { id: string, children: (setActivatorNodeRef: (el: HTMLElement | null) => void, listeners: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(setActivatorNodeRef, listeners)}
    </div>
  );
}
