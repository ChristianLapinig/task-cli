import { Command } from "commander";
import { unlinkSync } from "fs";

import { Status } from "../constants";
import {
  createBackup,
  restoreBackup
} from "../commons";

const defaultData: Data = {
  id_count: 1,
  tasks: [],
};

export default function addCommand(filePath: string, rootFolder: string) {
  const command = new Command("add");
  command
    .description("Adds a new task to your task list.")
    .argument("<string>", "Task description")
    .action(async (description: string) => {
      const file = Bun.file(filePath);

      if (!await file.exists()) {
        await Bun.write(filePath, JSON.stringify(defaultData));
      }

      const data: Data = await Bun.file(filePath).json();
      const backupFilePath = await createBackup(rootFolder, filePath);

      try {
        const task: Task = {
          id: data.id_count,
          status: Status.TODO,
          createdAt: new Date(),
          updatedAt: new Date(),
          description,
        };
        data.tasks.push(task);
        data.id_count++; // basically auto increment

        await Bun.write(filePath, JSON.stringify(data, null, 2));
        console.log("Task successfully created.");
      } catch (err) {
        restoreBackup(backupFilePath, filePath);
        throw err;
      } finally {
        unlinkSync(backupFilePath);
      }
    });

  return command;
}
