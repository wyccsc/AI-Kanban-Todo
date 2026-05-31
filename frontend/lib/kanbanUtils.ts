import type { ApiTask } from "@/types/api";
import type { Column, ColumnId, Task } from "@/types/kanban";

export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "Todo", taskIds: [] },
  { id: "doing", title: "Doing", taskIds: [] },
  { id: "done", title: "Done", taskIds: [] },
];

export function getColumnTasks(
  column: Column,
  tasks: Record<string, Task>,
): Task[] {
  return column.taskIds
    .map((id) => tasks[id])
    .filter((task): task is Task => task !== undefined);
}

export function findColumnId(
  columns: Column[],
  taskId: string,
): ColumnId | null {
  return columns.find((col) => col.taskIds.includes(taskId))?.id ?? null;
}

export function resolveOverColumnId(
  columns: Column[],
  overId: string,
): ColumnId | null {
  if (columns.some((col) => col.id === overId)) return overId as ColumnId;
  return findColumnId(columns, overId);
}

export function mapApiTasksToBoard(apiTasks: ApiTask[]): {
  tasks: Record<string, Task>;
  columns: Column[];
} {
  const columns = DEFAULT_COLUMNS.map((c) => ({ ...c, taskIds: [] as string[] }));
  const tasks: Record<string, Task> = {};

  for (const apiTask of apiTasks) {
    tasks[apiTask.id] = {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
    };
    const col = columns.find((c) => c.id === apiTask.status);
    col?.taskIds.push(apiTask.id);
  }

  return { tasks, columns };
}

export function moveTaskBetweenColumns(
  columns: Column[],
  activeTaskId: string,
  overId: string,
): Column[] | null {
  const activeColumnId = findColumnId(columns, activeTaskId);
  const overColumnId = resolveOverColumnId(columns, overId);
  if (!activeColumnId || !overColumnId) return null;

  const activeColumn = columns.find((c) => c.id === activeColumnId)!;
  const overColumn = columns.find((c) => c.id === overColumnId)!;

  if (activeColumnId === overColumnId) {
    const oldIndex = activeColumn.taskIds.indexOf(activeTaskId);
    const newIndex = activeColumn.taskIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;
    const next = [...activeColumn.taskIds];
    const [removed] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, removed);
    return columns.map((c) =>
      c.id === activeColumnId ? { ...c, taskIds: next } : c,
    );
  }

  const activeIds = activeColumn.taskIds.filter((id) => id !== activeTaskId);
  const overIds = [...overColumn.taskIds];
  const overIndex =
    overColumnId === overId ? overIds.length : overIds.indexOf(overId);
  if (overIndex === -1) return null;
  overIds.splice(overIndex, 0, activeTaskId);

  return columns.map((c) => {
    if (c.id === activeColumnId) return { ...c, taskIds: activeIds };
    if (c.id === overColumnId) return { ...c, taskIds: overIds };
    return c;
  });
}
