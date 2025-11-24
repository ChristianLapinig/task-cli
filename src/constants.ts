enum Status {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  DONE = "done",
}

enum Messages {
  NO_TASKS_AVAILABLE = "No tasks available.",
  TASK_NOT_FOUND = "Task not found",
  INVALID_ID = "Invalid task ID. Please provide a positive integer.",
  DATA_FILE_NOT_FOUND = "Data file not found.",
}

export {
  Status,
  Messages,
};
