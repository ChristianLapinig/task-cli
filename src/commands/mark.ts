import { Command } from "commander";
import { unlinkSync } from "fs";

import {
  createBackup,
  dataFileExists,
  hasTasks,
} from "../hooks";
import { findTask, restoreBackup } from "../commons";
import { Messages, Status } from "../constants";

export default function markCommand(filePath: string, rootFolder: string) {
  const markCmd = new Command("mark");

  markCmd
    .description("Marks the status of a given task based on the subcommand called.")
    .hook("preSubcommand", dataFileExists(filePath))
    .hook("preSubcommand", createBackup(rootFolder, filePath))
    .hook("preSubcommand", hasTasks(filePath))

  for (const status of Object.values(Status)) {
    markCmd.command(status)
      .description(`Changes the status of the given task to ${status}.`)
      .argument("<task-id>", "ID of the task to update.")
      .action(async function (this: any, idArg: string) {
        const id = parseInt(idArg);

        if (isNaN(id)) {
          console.log("Invalid argument. A valid ID must be passed.");
          return;
        }

        const data: Data = await Bun.file(filePath).json();
        const task: Task | undefined = findTask(data.tasks, id)
        if (task === undefined) {
          console.log(Messages.TASK_NOT_FOUND);
          return;
        }
        if (task !== undefined && task.status === status) {
          console.log(`Task ${id} already has the status of ${status}.`);
          return;
        }

        try {
          const tasks: Task[] = data.tasks.map((t: Task) => {
            return t.id === id ? {
              ...t,
              status,
              updatedAt: new Date(),
            } : t;
          });
          const updatedData: Data = {
            ...data,
            tasks,
          };
          await Bun.write(filePath, JSON.stringify(updatedData, null, 2));
          console.log(`Task ${id} marked as '${status}'.`);
        } catch (err) {
          restoreBackup(this.backupPath, filePath);
          throw err;
        } finally {
          unlinkSync(this.backupPath);
        }
      });
  }

  return markCmd;
}
