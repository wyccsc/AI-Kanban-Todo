import { create } from "zustand";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import {
  DEFAULT_COLUMNS,
  findColumnId,
  mapApiTasksToBoard,
  moveTaskBetweenColumns,
} from "@/lib/kanbanUtils";
import type { ColumnId, KanbanStore } from "@/types/kanban";

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  tasks: {},
  columns: DEFAULT_COLUMNS,
  isLoading: false,
  error: null,
  aiSubtasks: [],
  isAiLoading: false,
  aiError: null,

  clearError: () => set({ error: null }),

  fetchTasks: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const apiTasks = await api.fetchTasks();
      const { tasks, columns } = mapApiTasksToBoard(apiTasks);
      set({ tasks, columns, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  addTask: async ({ columnId, task }) => {
    set({ error: null });
    try {
      const created = await api.createTask({ ...task, status: columnId });
      set((state) => ({
        tasks: {
          ...state.tasks,
          [created.id]: {
            id: created.id,
            title: created.title,
            description: created.description,
          },
        },
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, taskIds: [...col.taskIds, created.id] }
            : col,
        ),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateTask: async ({ taskId, title, description, status }) => {
    set({ error: null });
    try {
      const updated = await api.updateTask(taskId, {
        title,
        description,
        status,
      });
      set((state) => {
        const prevColumn = findColumnId(state.columns, taskId);
        let columns = state.columns;

        if (status && prevColumn && status !== prevColumn) {
          columns = state.columns.map((col) => {
            if (col.id === prevColumn) {
              return {
                ...col,
                taskIds: col.taskIds.filter((id) => id !== taskId),
              };
            }
            if (col.id === status) {
              return { ...col, taskIds: [...col.taskIds, taskId] };
            }
            return col;
          });
        }

        return {
          tasks: {
            ...state.tasks,
            [taskId]: {
              id: updated.id,
              title: updated.title,
              description: updated.description,
            },
          },
          columns,
        };
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  moveTask: ({ activeTaskId, overId }) => {
    set((state) => {
      const next = moveTaskBetweenColumns(
        state.columns,
        activeTaskId,
        overId,
      );
      return next ? { columns: next } : state;
    });
  },

  persistTaskMove: async ({ activeTaskId, previousColumnId }) => {
    const columnId = findColumnId(get().columns, activeTaskId);
    if (!columnId || !get().tasks[activeTaskId]) return;
    if (columnId === previousColumnId) return;

    set({ error: null });
    try {
      await api.updateTask(activeTaskId, { status: columnId });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      await get().fetchTasks(true);
    }
  },

  deleteTask: async (taskId) => {
    set({ error: null });
    try {
      await api.deleteTask(taskId);
      set((state) => {
        const { [taskId]: _, ...tasks } = state.tasks;
        return {
          tasks,
          columns: state.columns.map((col) => ({
            ...col,
            taskIds: col.taskIds.filter((id) => id !== taskId),
          })),
        };
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  aiBreakdown: async (description) => {
    set({ isAiLoading: true, aiError: null, aiSubtasks: [] });
    try {
      const subtasks = await api.aiBreakdown(description);
      set({ aiSubtasks: subtasks, isAiLoading: false });
    } catch (error) {
      set({ isAiLoading: false, aiError: getErrorMessage(error) });
      throw error;
    }
  },

  addAiSubtasksToBoard: async (columnId = "todo") => {
    const { aiSubtasks } = get();
    if (aiSubtasks.length === 0) return;

    set({ error: null });
    try {
      for (const sub of aiSubtasks) {
        await get().addTask({
          columnId,
          task: {
            title: sub.title,
            description: sub.description?.trim() ?? "",
          },
        });
      }
      set({ aiSubtasks: [] });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  clearAiSubtasks: () => set({ aiSubtasks: [], aiError: null }),
}));
