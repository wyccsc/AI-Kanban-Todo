"use client";

import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useRef, useState } from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import type { ColumnId, Task } from "@/types/kanban";
import { findColumnId } from "@/lib/kanbanUtils";

export function useKanbanBoard() {
  const tasks = useKanbanStore((s) => s.tasks);
  const columns = useKanbanStore((s) => s.columns);
  const moveTask = useKanbanStore((s) => s.moveTask);
  const persistTaskMove = useKanbanStore((s) => s.persistTaskMove);
  const fetchTasks = useKanbanStore((s) => s.fetchTasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);
  const dragStartColumnRef = useRef<ColumnId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      dragStartColumnRef.current = findColumnId(columns, id);
      setActiveTask(tasks[id] ?? null);
    },
    [tasks, columns],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || isPersisting) return;
      moveTask({
        activeTaskId: String(active.id),
        overId: String(over.id),
      });
    },
    [moveTask, isPersisting],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const activeTaskId = String(event.active.id);
      setActiveTask(null);

      if (event.over && event.active.id !== event.over.id) {
        moveTask({
          activeTaskId,
          overId: String(event.over.id),
        });
      }

      const previousColumnId = dragStartColumnRef.current;
      dragStartColumnRef.current = null;

      setIsPersisting(true);
      try {
        await persistTaskMove({ activeTaskId, previousColumnId });
      } finally {
        setIsPersisting(false);
      }
    },
    [moveTask, persistTaskMove],
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    dragStartColumnRef.current = null;
    void fetchTasks(true);
  }, [fetchTasks]);

  return {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
