import { ApiError, parseApiErrorMessage } from "@/lib/errors";
import type {
  ApiErrorBody,
  ApiSubTask,
  ApiTask,
  ApiTaskCreate,
  ApiTaskUpdate,
  HealthResponse,
} from "@/types/api";

const API_BASE = "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      parseApiErrorMessage(body, `請求失敗 (${response.status})`),
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  fetchTasks: () => request<ApiTask[]>("/api/tasks"),

  createTask: (payload: ApiTaskCreate) =>
    request<ApiTask>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (taskId: string, payload: ApiTaskUpdate) =>
    request<ApiTask>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTask: (taskId: string) =>
    request<void>(`/api/tasks/${taskId}`, { method: "DELETE" }),

  aiBreakdown: (description: string) =>
    request<ApiSubTask[]>("/ai/breakdown", {
      method: "POST",
      body: JSON.stringify({ description }),
    }),
};
