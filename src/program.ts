import { Command } from "commander";

import {
  addCommand,
  listCommand,
  deleteCommand,
  markCommand,
  updateCommand,
} from "./commands"

const FILE_NAME = process.env.NODE_ENV === "test" ? "test_data.json" : "data.json";
export const ROOT_FOLDER = process.cwd();
export const FILE_PATH = `${ROOT_FOLDER}/${FILE_NAME}`;


export default function createProgram() {
  const program = new Command();

  program
    .name("task-cli")
    .description("task-cli is a CLI to help you manage your daily tasks.")
    .version("1.0.0");

  program.addCommand(addCommand(FILE_PATH, ROOT_FOLDER));
  program.addCommand(listCommand(FILE_PATH));
  program.addCommand(deleteCommand(FILE_PATH, ROOT_FOLDER));
  program.addCommand(markCommand(FILE_PATH, ROOT_FOLDER));
  program.addCommand(updateCommand(FILE_PATH, ROOT_FOLDER));

  return program;
}
