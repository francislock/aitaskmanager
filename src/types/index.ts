export type Category = 'work_projects' | 'personal_home' | 'shopping' | 'quick_ideas';
export type Status = 'pending' | 'completed';

export interface List {
  id: string;
  user_id?: string;
  name: string;
  emoji: string;
  color: string;
  order_index: number;
  is_default: boolean;
  created_at: string;
}

export interface Subtask {
  id: string;
  parent_task_id: string;
  content: string;
  status: Status;
  order_index: number;
  created_at: string;
}

export interface Task {
  id: string;
  content: string;
  list_category: Category; // Deprecated, usar list_id
  list_id?: string;
  status: Status;
  created_at: string; // ISO string
  completed_at?: string; // ISO string
  raw_input?: string;
  suggested_due_date?: string;
  priority?: 'high' | 'medium' | 'low';
  order_index?: number;
  subtasks?: Subtask[];
}

export interface AIResponse {
  intent: 'create_task' | 'modify_task' | 'query_list';
  tasks?: Partial<Task>[];
  message?: string;
} // For feedback or clarification
