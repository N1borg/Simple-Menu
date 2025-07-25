// DndKitWrapper.tsx
import { DndContext, closestCenter, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ReactNode, useState } from 'react';

interface DndKitWrapperProps<T = any> {
  items: T[];
  onDragEnd: (oldIndex: number, newIndex: number) => void;
  children: ReactNode;
  modifiers?: any[];
  renderOverlay?: (activeId: string | null) => ReactNode;
  id?: string;
  strategy?: any;
}

export function DndKitWrapper<T = any>({ items, onDragEnd, children, modifiers, renderOverlay, id, strategy = rectSortingStrategy }: DndKitWrapperProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 10,
      },
    })
  );
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={event => setActiveId(event.active.id as string)}
      onDragEnd={event => {
        setActiveId(null);
        const { active, over } = event;
        if (active.id !== over?.id) {
          const oldIndex = items.findIndex((i: any) => i.id === active.id);
          const newIndex = items.findIndex((i: any) => i.id === over?.id);
          onDragEnd(oldIndex, newIndex);
        }
      }}
      onDragCancel={() => setActiveId(null)}
      modifiers={modifiers || [restrictToVerticalAxis]}
    >
      <SortableContext items={items.map((i: any) => i.id)} strategy={strategy}>
        {children}
      </SortableContext>
      <DragOverlay>
        {activeId && renderOverlay ? renderOverlay(activeId) : null}
      </DragOverlay>
    </DndContext>
  );
}
