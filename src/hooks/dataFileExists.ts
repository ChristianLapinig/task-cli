import fs from "fs";
import { Command } from "commander";

/**
 * Validates if the data.json file exists.
 * If the file doesn't exist, the program will exit.
 *
 * @param filePath where the data.json file resides
 */
export default function dataFileExists(filePath: string) {
  return (thisCommand: Command, actionCommand: Command) => {
    if (!fs.existsSync(filePath)) {
      console.log("Data file not found.");
      process.exit(1);
    }
  };
}
