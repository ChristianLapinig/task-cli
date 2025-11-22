import fs from "fs";
import { Command } from "commander";

import { Messages } from "../constants";

/**
 * Commander hook that determines if the tasks
 * property in data.json exists or has tasks.
 * The hook will exit the program if tasks don't exist.
 *
 * @param filePath path to data.json
 */
export default function hasTasks(filePath: string) {
  return (thisComand: Command, actionCommand: Command) => {
    const file = fs.readFileSync(filePath, "utf-8");
    const data: Data = JSON.parse(file);
    if (data.tasks === undefined || data.tasks.length === 0) {
      console.log(Messages.NO_TASKS_AVAILABLE);
      process.exit(1);
    }
  };
}
