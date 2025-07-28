// DndKitWrapper.tsx - Updated version
import { DndContext, closestCenter, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ReactNode, useState } from 'react';

interface DndKitWrapperProps<T = any> {
  items: T[];
  onDragEnd: (oldIndex: number, newIndex: number) => void;
  onDragOver?: (activeId: string, overId: string) => void; // NEW: For cross-category movement
  children: ReactNode;
  modifiers?: any[];
  renderOverlay?: (activeId: string | null) => ReactNode;
  id?: string;
  strategy?: any;
}

export function DndKitWrapper<T = any>({ 
  items, 
  onDragEnd, 
  onDragOver, // NEW
  children, 
  modifiers, 
  renderOverlay, 
  id, 
  strategy = rectSortingStrategy 
}: DndKitWrapperProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // UPDATED: Mobile-optimized sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased from 5 to prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press for mobile (was 300ms)
        tolerance: 5, // Reduced from 10 for better responsiveness
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={event => setActiveId(event.active.id as string)}
      onDragOver={event => { // NEW: Handle cross-category movement
        if (onDragOver && event.over) {
          onDragOver(event.active.id as string, event.over.id as string);
        }
      }}
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
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}> {/* UPDATED: Better animation */}
        {activeId && renderOverlay ? renderOverlay(activeId) : null}
      </DragOverlay>
    </DndContext>
  );
}
