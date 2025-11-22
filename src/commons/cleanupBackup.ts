import { unlinkSync, existsSync } from "fs";

export default function cleanupBackup(filePath: string) {
	try {
		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}
	} catch (err) {
		console.error("Failed to clean up backup file:", err);
	}
}
