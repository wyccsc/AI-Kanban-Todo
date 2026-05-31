"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { TaskCard } from "@/components/TaskCard";
import { useKanbanStore } from "@/store/kanbanStore";
import type { Task } from "@/types/kanban";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

export function SortableTaskCard({ task, onEdit }: Props) {
  const deleteTask = useKanbanStore((s) => s.deleteTask);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const handleDelete = async (taskId: string) => {
    setIsDeleting(true);
    try {
      await deleteTask(taskId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </li>
  );
}
