import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';

export function SortableItem({ id, children }: { id: string, children: ReactNode }) {
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
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, (subChild: any) => {
          if (
            React.isValidElement(subChild) &&
            typeof subChild.props.className === 'string' &&
            subChild.props.className.includes('dnd-handle')
          ) {
            handleFound = true;
            return React.cloneElement(subChild, { ...listeners });
          }
          return subChild;
        })
      });
    }
    return child;
  });
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(!handleFound ? listeners : {})}>
      {wrapped}
    </div>
  );
}
