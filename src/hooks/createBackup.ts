import { Command } from "commander";
import fs from "fs";

/**
 * Creates a backup file with the given contents at the provided path.
 * Backups will be created in a folder named "backups" where the parent
 * path is the given filepath.
 *
 * @param folderPath folder where backups should be created if backups don't exist
 * @param filePath data to backup
 */
export default function createBackup(folderPath: string, filePath: string) {
  return (thisCommand: Command, actionCommand: Command) => {

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFolder = `${folderPath}/backups`;

    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder);
    }

    const backupPath = `${backupFolder}/backup.${timestamp}.json`;
    fs.copyFileSync(filePath, backupPath);
    (actionCommand as any).backupPath = backupPath;
  };
}
