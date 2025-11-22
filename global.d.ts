import { Status } from "./src/constants";

declare global {
  type TaskStatus = Status.TODO | Status.IN_PROGRESS | Status.DONE;

  interface Task {
    id: number;
    description: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Data {
    id_count: number;
    tasks: Task[];
  }
}

export { };
