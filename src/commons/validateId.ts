import { Messages } from "../constants";

export default function validateId(id: number) {
	if (isNaN(id) || id <= 0) {
		console.log(Messages.INVALID_ID);
		process.exit(1);
	} 
}
