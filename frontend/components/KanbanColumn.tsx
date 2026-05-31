"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "@/components/SortableTaskCard";
import { getColumnTasks } from "@/lib/kanbanUtils";
import type { Column, Task } from "@/types/kanban";

const ACCENTS: Record<Column["id"], string> = {
  todo: "bg-slate-500",
  doing: "bg-amber-500",
  done: "bg-emerald-500",
};

interface Props {
  column: Column;
  tasks: Record<string, Task>;
  onEdit: (task: Task) => void;
}

export function KanbanColumn({ column, tasks, onEdit }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const columnTasks = getColumnTasks(column, tasks);

  return (
    <section
      className={`flex min-h-[360px] flex-1 flex-col rounded-xl border bg-column transition-colors ${
        isOver ? "border-accent/60" : "border-border"
      }`}
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className={`h-2 w-2 rounded-full ${ACCENTS[column.id]}`} />
        <h2 className="text-sm font-semibold">{column.title}</h2>
        <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs text-text-muted">
          {columnTasks.length}
        </span>
      </header>

      <SortableContext
        id={column.id}
        items={column.taskIds}
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          className="flex min-h-[200px] flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
          {columnTasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
          {columnTasks.length === 0 && (
            <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-text-muted">
              拖曳任務至此
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}
