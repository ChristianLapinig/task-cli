import { Command, InvalidArgumentError } from "commander";
import { existsSync, unlinkSync } from "fs";

import {
  dataFileExists,
  hasTasks,
} from "../hooks";
import {
  restoreBackup,
  createBackup,
  cleanupBackup,
  findTask,
} from "../commons";
import { Messages } from "../constants";

export default function deleteCommand(filePath: string, rootFolder: string) {
  const command = new Command("delete");

  command
    .description("Deletes the task with the given ID.")
    .hook("preAction", dataFileExists(filePath))
    .hook("preAction", hasTasks(filePath))
    .argument("<number>", "ID of the task to delete")
    .action(async function (this: any, idArg: string) {
      const id = Number.parseInt(idArg);
      if (isNaN(id)) {
        console.log("Invalid argument. A valid ID must be passed.");
        return;
      }

      const data: Data = await Bun.file(filePath).json();
      const task: Task | undefined = findTask(data.tasks, id)
      if (task === undefined) {
        console.log(`${Messages.TASK_NOT_FOUND} with ID ${id}.`);
        return;
      }
      const backupFilePath = createBackup(rootFolder, filePath);


      try {
        const tasks = data.tasks.filter(task => task.id !== id);
        const updatedData = {
          ...data,
          tasks,
        };
        await Bun.write(filePath, JSON.stringify(updatedData, null, 2));
        console.log(`Task ${id} successfully deleted.`);
      } catch (err) {
        restoreBackup(backupFilePath, filePath);
        throw err;
      } finally {
        cleanupBackup(backupFilePath);
      }
    });

  return command;
}
