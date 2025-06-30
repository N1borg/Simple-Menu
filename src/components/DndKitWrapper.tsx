// DndKitWrapper.tsx
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ReactNode } from 'react';

export function DndKitWrapper({ items, onDragEnd, children, modifiers }: {
  items: any[],
  onDragEnd: (oldIndex: number, newIndex: number) => void,
  children: ReactNode,
  modifiers?: any[]
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={event => {
        const { active, over } = event;
        if (active.id !== over?.id) {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over?.id);
          onDragEnd(oldIndex, newIndex);
        }
      }}
      modifiers={modifiers || [restrictToVerticalAxis]}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
