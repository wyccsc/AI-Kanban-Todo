import type { ColumnId } from "./kanban";

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  status: ColumnId;
  created_at: string;
  updated_at: string;
}

export interface ApiTaskCreate {
  title: string;
  description: string;
  status: ColumnId;
}

export interface ApiTaskUpdate {
  title?: string;
  description?: string;
  status?: ColumnId;
}

export interface ApiSubTask {
  id: number;
  title: string;
  description?: string;
}

export interface ApiErrorBody {
  detail?: string | { msg: string; type: string }[];
}

export interface HealthResponse {
  status: string;
  service: string;
  ollama_reachable: boolean;
  ollama_model: string;
  ollama_model_ready: boolean;
}
