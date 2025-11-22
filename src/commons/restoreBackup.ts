import fs from "fs";

/**
 * Restores the destination file from backup at src
 *
 * @param src location of the backup data
 * @param dest path to restore to
 */
export default function restoreBackup(src: string, dest: string) {
  fs.copyFileSync(src, dest);
}
