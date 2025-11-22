import { Command } from "commander";
import { unlinkSync, existsSync } from "fs";

import {
  createBackup,
  dataFileExists,
  hasTasks,
} from "../hooks";
import {
  restoreBackup,
} from "../commons"

export default function updateCommand(filepath: string, rootFolder: string) {
  const command = new Command("update");

  command
    .description("Updates a task with the given id.")
    .hook("preAction", dataFileExists(filepath))
    .hook("preAction", createBackup(rootFolder, filepath))
    .hook("preAction", hasTasks(filepath))
    .argument("<id>", "ID of the task to update.")
    .argument("<string>", "Task description. I.e., 'bring car to the mechanic.'")
    .action(async function (this: any, idArg: string, description: string) {
      const id = parseInt(idArg);
      if (isNaN(id)) {
        console.log("Invalid argument. A valid ID must be passed.");
        return;
      }

      if (description === undefined || description.length === 0) {
        console.log("No task input was passed.");
        return;
      }

      const data: Data = await Bun.file(filepath).json();
      const task: Task | undefined = data.tasks.find(t => t.id === id);
      if (task === undefined) {
        console.log(`Task ${id} doesn't exist.`);
        return;
      }

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
        restoreBackup(this.backupPath, filepath);
        throw err;
      } finally {
        unlinkSync(this.backupPath);
      }
    });

  return command;
}
