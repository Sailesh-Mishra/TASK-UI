export type TaskStatus = 'todo' | 'in_progress' | 'done';
export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    created_at: string;
    owner?: string;          // only present for admins
}
export interface Paginated<T> {
    data: T[];
    meta: { current_page: number; last_page: number, total: number };
}

export interface TaskPayload {
    title: string;
    description: string;
    status: TaskStatus;
}