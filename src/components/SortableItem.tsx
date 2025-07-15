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
  };
  // Fallback: if no drag handle found, apply listeners to the wrapper
  let handleFound = false;
  const wrapped = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Check if any direct child has the dnd-handle class
      if (
        React.isValidElement(child) &&
        child.props &&
        typeof child.props.className === 'string' &&
        child.props.className.includes('dnd-handle')
      ) {
        handleFound = true;
        return React.cloneElement(child, { ...listeners });
      }
    }
    return child;
  });
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(!handleFound ? listeners : {})}>
      {wrapped}
    </div>
  );
}
