"use client";

import type { Task } from "@/types/kanban";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDeleting?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDeleting,
}: TaskCardProps) {
  return (
    <article className="group relative rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-card-hover">
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(task)}
          onPointerDown={(e) => e.stopPropagation()}
          className="rounded px-2 py-1 text-xs text-text-muted hover:bg-accent/20 hover:text-accent"
        >
          編輯
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isDeleting}
          className="rounded px-2 py-1 text-xs text-text-muted hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
        >
          {isDeleting ? "…" : "刪除"}
        </button>
      </div>
      <h3 className="pr-20 text-sm font-semibold">{task.title}</h3>
      {task.description ? (
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          {task.description}
        </p>
      ) : (
        <p className="mt-2 text-xs italic text-text-muted/60">（無說明）</p>
      )}
    </article>
  );
}
