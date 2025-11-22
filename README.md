# Task CLI

## Overview

Source description: <https://roadmap.sh/projects/task-tracker>

The Task Tracker CLI is a command-line tool to help manage your tasks/to-do list. The CLI allows you to view your backlog of tasks, in-progress tasks, and completed tasks.

## Requirements

TypeScript 5+
Bun 1.2.0+

## Installation and Running the CLI

To install and run the CLI, follow the steps below:

Install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts --help
```

# Running Tests

To run tests simply run:

```bash
bun test
```

## Building the CLI

For now, Bun is used to build the CLI. There is a `build` script in
`package.json` and can be used to build the CLI as follows:

```bash
bun run build
```

Running the final build:

```bash
./task-cli --help
```

## Usage

```bash
# Adding a new task
task-cli add "Buy groceries"
# Output: Task added successfully (ID: 1)
# Updating and deleting tasks
task-cli update 1 "Buy groceries and cook dinner"
task-cli delete 1
# Marking a task as in progress or done
task-cli mark-in-progress 1
task-cli mark-done 1
# Listing all tasks
task-cli list
# Listing tasks by status
task-cli list done
task-cli list todo
task-cli list in-progress
```

This project was created using `bun init` in bun v1.2.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
