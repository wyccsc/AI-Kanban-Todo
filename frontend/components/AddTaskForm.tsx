"use client";

import { type FormEvent, useState } from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import type { ColumnId } from "@/types/kanban";

const COLUMNS: { value: ColumnId; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" },
];

export function AddTaskForm() {
  const addTask = useKanbanStore((s) => s.addTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>("todo");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await addTask({
        columnId,
        task: { title: trimmed, description: description.trim() },
      });
      setTitle("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-column p-4"
    >
      <h2 className="text-sm font-semibold">手動新增任務</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="任務標題 *"
          required
          maxLength={200}
          disabled={submitting}
          className="input-field sm:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="說明（選填）"
          rows={2}
          disabled={submitting}
          className="input-field resize-none sm:col-span-2"
        />
        <select
          value={columnId}
          onChange={(e) => setColumnId(e.target.value as ColumnId)}
          disabled={submitting}
          className="input-field"
        >
          {COLUMNS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="btn-primary"
        >
          {submitting ? "新增中…" : "新增任務"}
        </button>
      </div>
    </form>
  );
}
