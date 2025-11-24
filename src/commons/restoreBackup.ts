import fs from "fs";

/**
 * Restores the destination file from backup at src
 *
 * @param src location of the backup data
 * @param dest path to restore to
 */
export default function restoreBackup(src: string, dest: string) {
  try { 
    fs.copyFileSync(src, dest);
  } catch (err) {
    console.error("Failed to restore backup:", err);
    throw new Error(`Failed to restore backup from ${src} to ${dest}: ${err}`);
  }
}
