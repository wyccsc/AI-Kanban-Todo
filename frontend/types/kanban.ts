export type ColumnId = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}

export type NewTaskInput = Pick<Task, "title" | "description">;

export interface AddTaskParams {
  columnId: ColumnId;
  task: NewTaskInput;
}

export interface UpdateTaskParams {
  taskId: string;
  title?: string;
  description?: string;
  status?: ColumnId;
}

export interface MoveTaskParams {
  activeTaskId: string;
  overId: string;
}

export interface PersistTaskMoveParams {
  activeTaskId: string;
  previousColumnId: ColumnId | null;
}

export interface AiSubTask {
  id: number;
  title: string;
  description?: string;
}

export interface KanbanState {
  tasks: Record<string, Task>;
  columns: Column[];
  isLoading: boolean;
  error: string | null;
  aiSubtasks: AiSubTask[];
  isAiLoading: boolean;
  aiError: string | null;
}

export interface KanbanActions {
  fetchTasks: (silent?: boolean) => Promise<void>;
  addTask: (params: AddTaskParams) => Promise<void>;
  updateTask: (params: UpdateTaskParams) => Promise<void>;
  moveTask: (params: MoveTaskParams) => void;
  persistTaskMove: (params: PersistTaskMoveParams) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  aiBreakdown: (description: string) => Promise<void>;
  addAiSubtasksToBoard: (columnId?: ColumnId) => Promise<void>;
  clearAiSubtasks: () => void;
  clearError: () => void;
}

export type KanbanStore = KanbanState & KanbanActions;
