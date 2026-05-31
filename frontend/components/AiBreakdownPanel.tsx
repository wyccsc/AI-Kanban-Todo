"use client";

import { type FormEvent, useState } from "react";
import { useKanbanStore } from "@/store/kanbanStore";

export function AiBreakdownPanel() {
  const aiBreakdown = useKanbanStore((s) => s.aiBreakdown);
  const addAiSubtasksToBoard = useKanbanStore((s) => s.addAiSubtasksToBoard);
  const clearAiSubtasks = useKanbanStore((s) => s.clearAiSubtasks);
  const aiSubtasks = useKanbanStore((s) => s.aiSubtasks);
  const isAiLoading = useKanbanStore((s) => s.isAiLoading);
  const aiError = useKanbanStore((s) => s.aiError);

  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const handleBreakdown = async (e: FormEvent) => {
    e.preventDefault();
    const text = description.trim();
    if (!text || isAiLoading) return;
    try {
      await aiBreakdown(text);
    } catch {
      /* error in store */
    }
  };

  const handleAddAll = async () => {
    setAdding(true);
    try {
      await addAiSubtasksToBoard("todo");
      setDescription("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="rounded-xl border border-accent/30 bg-column p-4">
      <h2 className="text-sm font-semibold text-accent">AI 任務拆解</h2>
      <p className="mt-1 text-xs text-text-muted">
        輸入任務描述，由本地 Ollama 拆解成子任務
      </p>

      <form onSubmit={handleBreakdown} className="mt-4 space-y-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例如：建立一個 Kanban 待辦應用，包含前後端、Docker 與 AI 拆解功能"
          rows={3}
          disabled={isAiLoading}
          className="input-field resize-none"
        />
        <button
          type="submit"
          disabled={isAiLoading || !description.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          {isAiLoading ? "AI 拆解中…" : "AI 拆解任務"}
        </button>
      </form>

      {aiError && (
        <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {aiError}
        </p>
      )}

      {aiSubtasks.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-text-muted">
              拆解結果（{aiSubtasks.length} 項）
            </h3>
            <button
              type="button"
              onClick={clearAiSubtasks}
              className="text-xs text-text-muted hover:text-text"
            >
              清除
            </button>
          </div>
          <ul className="space-y-2">
            {aiSubtasks.map((sub) => (
              <li
                key={sub.id}
                className="rounded-lg border border-border bg-board px-3 py-2 text-sm"
              >
                <div>
                  <span className="mr-2 text-text-muted">{sub.id}.</span>
                  {sub.title}
                </div>
                {sub.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {sub.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleAddAll}
            disabled={adding}
            className="btn-primary w-full"
          >
            {adding ? "加入中…" : "全部加入 Todo 欄"}
          </button>
        </div>
      )}
    </section>
  );
}
