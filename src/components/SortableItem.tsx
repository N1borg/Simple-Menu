'use client'

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';

export function SortableItem({ id, children }: { id: string, children: React.ReactElement<{ className?: string }> | React.ReactElement<{ className?: string }>[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
    touchAction: 'none', // IMPORTANT: Prevents scrolling during drag
    cursor: isDragging ? 'grabbing' : 'grab', // UPDATED: Better cursor feedback
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="touch-manipulation" // ADDED: Better touch handling
    >
      {children}
    </div>
  );
}
