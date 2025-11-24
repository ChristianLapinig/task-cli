import { Command } from "commander";

import {
  dataFileExists,
  hasTasks,
} from "../hooks";
import {
  restoreBackup,
  createBackup,
  findTask,
  validateId,
} from "../commons"
import cleanupBackup from "../commons/cleanupBackup";
import { Messages } from "../constants";

export default function updateCommand(filepath: string, rootFolder: string) {
  const command = new Command("update");

  command
    .description("Updates a task with the given id.")
    .hook("preAction", dataFileExists(filepath))
    .hook("preAction", hasTasks(filepath))
    .argument("<id>", "ID of the task to update.")
    .argument("<string>", "Task description. I.e., 'bring car to the mechanic.'")
    .action(async function (idArg: string, description: string) {
      const id = parseInt(idArg);
      validateId(id);

      if (description === undefined || description.length === 0) {
        console.log("No task input was passed.");
        return;
      }

      const data: Data = await Bun.file(filepath).json();
      const task: Task | undefined = findTask(data.tasks, id);
      if (task === undefined) {
        console.log(`${Messages.TASK_NOT_FOUND} with ID ${id}.`);
        return;
      }

      const backupFilePath = createBackup(rootFolder, filepath);

      try {
        const tasks: Task[] = data.tasks.map((t: Task) => {
          return t.id === id ? {
            ...t,
            description,
            updatedAt: new Date(),
          } : t;
        });
        const updatedData: Data = {
          ...data,
          tasks,
        };
        await Bun.write(filepath, JSON.stringify(updatedData, null, 2));
        console.log(`Task ${id} updated successfully.`);
      } catch (err) {
        restoreBackup(backupFilePath, filepath);
        throw err;
      } finally {
        cleanupBackup(backupFilePath);
      }
    });

  return command;
}
