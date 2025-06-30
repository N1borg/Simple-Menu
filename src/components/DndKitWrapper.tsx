// DndKitWrapper.tsx
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ReactNode, useState } from 'react';

export function DndKitWrapper({ items, onDragEnd, children, modifiers, renderOverlay }: {
  items: any[],
  onDragEnd: (oldIndex: number, newIndex: number) => void,
  children: ReactNode,
  modifiers?: any[],
  renderOverlay?: (activeId: string|null) => ReactNode
}) {
  const [activeId, setActiveId] = useState<string|null>(null);
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
      onDragStart={event => setActiveId(event.active.id as string)}
      onDragEnd={event => {
        setActiveId(null);
        const { active, over } = event;
        if (active.id !== over?.id) {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over?.id);
          onDragEnd(oldIndex, newIndex);
        }
      }}
      onDragCancel={() => setActiveId(null)}
      modifiers={modifiers || [restrictToVerticalAxis]}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay>
        {activeId && renderOverlay ? renderOverlay(activeId) : null}
      </DragOverlay>
    </DndContext>
  );
}
