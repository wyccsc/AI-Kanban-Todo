"use client";

import { DragOverlay } from "@dnd-kit/core";
import { TaskCard } from "@/components/TaskCard";
import type { Task } from "@/types/kanban";

export function KanbanDragOverlay({ task }: { task: Task | null }) {
  return (
    <DragOverlay dropAnimation={null}>
      {task ? (
        <div className="rotate-1 scale-[1.02] shadow-lg">
          <TaskCard
            task={task}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      ) : null}
    </DragOverlay>
  );
}
