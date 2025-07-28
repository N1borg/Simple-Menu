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
  children: React.ReactElement<{ className?: string }> | React.ReactElement<{ className?: string }>[], 
  disabled?: boolean 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    disabled // Pass disabled state to useSortable
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
    touchAction: disabled ? 'auto' : 'none', // Allow normal touch when disabled
    cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...(disabled ? {} : listeners)} // Don't attach listeners when disabled
      className={`touch-manipulation ${disabled ? '' : 'cursor-grab'}`}
    >
      {children}
    </div>
  );
}
