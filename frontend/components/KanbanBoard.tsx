"use client";

import { DndContext, closestCorners } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { AddTaskForm } from "@/components/AddTaskForm";
import { AiBreakdownPanel } from "@/components/AiBreakdownPanel";
import { BoardStatus } from "@/components/BoardStatus";
import { EditTaskModal } from "@/components/EditTaskModal";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanDragOverlay } from "@/components/KanbanDragOverlay";
import { useKanbanBoard } from "@/hooks/useKanbanBoard";
import { findColumnId } from "@/lib/kanbanUtils";
import { useKanbanStore } from "@/store/kanbanStore";
import type { Task } from "@/types/kanban";

export function KanbanBoard() {
  const fetchTasks = useKanbanStore((s) => s.fetchTasks);
  const clearError = useKanbanStore((s) => s.clearError);
  const tasks = useKanbanStore((s) => s.tasks);
  const columns = useKanbanStore((s) => s.columns);
  const isLoading = useKanbanStore((s) => s.isLoading);
  const error = useKanbanStore((s) => s.error);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanBoard();

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const showBoard = !isLoading && !error;
  const editingColumnId = editingTask
    ? findColumnId(columns, editingTask.id)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          AI 任務管理板
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Kanban Todo App · 本地 Ollama 拆解 · 拖曳管理
        </p>
      </header>

      <BoardStatus
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          clearError();
          void fetchTasks();
        }}
      />

      {error && showBoard && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          {error}
        </p>
      )}

      {showBoard && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  onEdit={setEditingTask}
                />
              ))}
            </div>
            <KanbanDragOverlay task={activeTask} />
          </DndContext>

          <div className="grid gap-4 xl:grid-cols-2">
            <AddTaskForm />
            <AiBreakdownPanel />
          </div>
        </>
      )}

      {editingTask && editingColumnId && (
        <EditTaskModal
          task={editingTask}
          columnId={editingColumnId}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
