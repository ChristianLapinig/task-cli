import { Command } from "commander";
import { unlinkSync } from "fs";

import {
  dataFileExists,
  hasTasks,
} from "../hooks";
import { findTask, restoreBackup, createBackup, cleanupBackup, validateId } from "../commons";
import { Messages, Status } from "../constants";

export default function markCommand(filePath: string, rootFolder: string) {
  const markCmd = new Command("mark");

  markCmd
    .description("Marks the status of a given task based on the subcommand called.")
    .hook("preSubcommand", dataFileExists(filePath))
    .hook("preSubcommand", hasTasks(filePath))

  for (const status of Object.values(Status)) {
    markCmd.command(status)
      .description(`Changes the status of the given task to ${status}.`)
      .argument("<task-id>", "ID of the task to update.")
      .action(async function (idArg: string) {
        const id = parseInt(idArg);
        validateId(id);

        const data: Data = await Bun.file(filePath).json();
        const task: Task | undefined = findTask(data.tasks, id)
        if (task === undefined) {
          console.log(`${Messages.TASK_NOT_FOUND} with ID ${id}.`);
          return;
        }
        if (task !== undefined && task.status === status) {
          console.log(`Task ${id} already has the status of ${status}.`);
          return;
        }

        const backupFilePath = createBackup(rootFolder, filePath);

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
          restoreBackup(backupFilePath, filePath);
          throw err;
        } finally {
          cleanupBackup(backupFilePath);
        }
      });
  }

  return markCmd;
}
