import { Command, InvalidArgumentError } from "commander";
import { existsSync, unlinkSync } from "fs";

import {
  dataFileExists,
  createBackup,
  hasTasks,
} from "../hooks";
import {
  restoreBackup,
} from "../commons";

export default function deleteCommand(filePath: string, rootFolder: string) {
  const command = new Command("delete");

  command
    .description("Deletes the task with the given ID.")
    .hook("preAction", dataFileExists(filePath))
    .hook("preAction", createBackup(rootFolder, filePath))
    .hook("preAction", hasTasks(filePath))
    .argument("<number>", "ID of the task to delete")
    .action(async function (this: any, idArg: string) {
      const id = Number.parseInt(idArg);
      if (isNaN(id)) {
        console.log("Invalid argument. A valid ID must be passed.");
        return;
      }

      const data: Data = await Bun.file(filePath).json();

      if (data["tasks"].find(task => task.id === id) === undefined) {
        console.log(`Task with ID ${id} cannot be found.`);
        return;
      }

      try {
        const tasks = data.tasks.filter(task => task.id !== id);
        const updatedData = {
          ...data,
          tasks,
        };
        await Bun.write(filePath, JSON.stringify(updatedData, null, 2));
        console.log(`Task ${id} successfully deleted.`);
      } catch (err) {
        restoreBackup(this.backupPath, filePath)
      } finally {
        unlinkSync(this.backupPath);
      }
    });

  return command;
}
