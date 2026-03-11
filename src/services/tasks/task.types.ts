export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type CreateTaskInput = {
  userId: string;
  title: string;
};

export type ToggleTaskInput = {
  userId: string;
  taskId: string;
  completed: boolean;
};

export type DeleteTaskInput = {
  userId: string;
  taskId: string;
};

export type TaskSummary = {
  total: number;
  completed: number;
  pending: number;
};
