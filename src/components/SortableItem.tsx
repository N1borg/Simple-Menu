'use client'

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';

export function SortableItem({ 
  id, 
  children,
  disabled = false 
}: { 
  id: string, 
  children: React.ReactNode, 
  disabled?: boolean 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    disabled
  });
  
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
    // Disable pointer events when editing
    pointerEvents: disabled ? 'none' : 'auto',
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...(disabled ? {} : listeners)} // Only attach listeners when not disabled
      className={`${disabled ? 'pointer-events-none' : ''}`}
    >
      {children}
    </div>
  );
}
