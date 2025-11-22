import { Command } from "commander";
import Table from "cli-table";
import {
  dataFileExists,
  hasTasks,
} from "../hooks"
import { Status, Messages } from "../constants";

function displayTasks(tasks: any[], headers: string[]) {
  const table = new Table({
    head: headers,
    rows: tasks,
  });

  console.log(table.toString());
}

export default function listCommand(filePath: string) {
  const listCmd = new Command("list");

  listCmd
    .description("List all tasks.")
    .hook("preAction", dataFileExists(filePath))
    .hook("preAction", hasTasks(filePath))
    .action(async () => {
      const data: Data = await Bun.file(filePath).json();
      const tasks = data.tasks
        .map(task => ([task.id, task.description, task.status]));

      if (tasks.length === 0) {
        console.log("No tasks to display.")
        return;
      }

      displayTasks(tasks, ["ID", "Task", "Status"]);
    });

  for (const status of Object.values(Status)) {
    listCmd.command(status as string)
      .description(`List tasks with the status of ${status}`)
      .hook("preAction", dataFileExists(filePath))
      .hook("preAction", hasTasks(filePath))
      .action(async () => {
        const data: Data = await Bun.file(filePath).json();
        const tasks = data.tasks
          .filter(task => task.status === status)
          .map(task => ([task.description]));

        if (tasks.length === 0) {
          console.log(Messages.NO_TASKS_AVAILABLE);
          return;
        }

        displayTasks(tasks, [`Task (${status})`]);
      });
  }

  return listCmd;
}
