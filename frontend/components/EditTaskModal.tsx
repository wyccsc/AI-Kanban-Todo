"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import type { ColumnId, Task } from "@/types/kanban";

interface Props {
  task: Task;
  columnId: ColumnId;
  onClose: () => void;
}

export function EditTaskModal({ task, columnId, onClose }: Props) {
  const updateTask = useKanbanStore((s) => s.updateTask);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<ColumnId>(columnId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(columnId);
  }, [task, columnId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      await updateTask({
        taskId: task.id,
        title: trimmed,
        description: description.trim(),
        status,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-border bg-column p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">編輯任務</h2>
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ColumnId)}
            className="input-field"
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "儲存中…" : "儲存"}
          </button>
        </div>
      </form>
    </div>
  );
}
