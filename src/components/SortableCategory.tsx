import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

export function SortableCategory({ id, children }: { id: string, children: React.ReactElement<{ className?: string }> | React.ReactElement<{ className?: string }>[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  };
  let handleFound = false;
  const wrapped = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (
        child.props &&
        typeof child.props.className === 'string' &&
        child.props.className.includes('dnd-handle-cat')
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
