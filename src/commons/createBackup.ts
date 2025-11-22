import fs from "fs";

/**
 * Creates a backup file with the given contents at the provided path.
 * Backups will be created in a folder named "backups" where the parent
 * path is the given filepath.
 *
 * @param filepath parent file path
 * @param data data to backup
 * @returns path to the backup file
 */
export default async function createBackup(folderPath: string, filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFolder = `${folderPath}/backups`;

  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
  }

  const backupPath = `${backupFolder}/backup.${timestamp}.json`;
  fs.copyFileSync(filePath, backupPath);

  return backupPath;
}
