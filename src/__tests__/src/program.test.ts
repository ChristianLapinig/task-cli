import {
  expect,
  test,
  describe,
  beforeEach,
  afterEach,
  spyOn,
} from "bun:test";
import { unlinkSync, existsSync } from "node:fs";

process.env.NODE_ENV = "test";
import createProgram, { FILE_PATH } from "../../program.ts";
import { Status, Messages } from "../../constants";

describe("task-cli program", () => {
  let exitSpy: any;
  let consoleSpy: any;
  beforeEach(() => {
    exitSpy = spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
    consoleSpy = spyOn(console, "log").mockImplementation(() => { });

    if (existsSync(FILE_PATH)) {
      unlinkSync(FILE_PATH); // remove temp file before each test
    }
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleSpy.mockRestore();

    if (existsSync(FILE_PATH)) {
      unlinkSync(FILE_PATH); // remove temp file after each test
    }
  });

  describe("add command", () => {
    test("json file should be created if it doesn't exist", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "Test task"]);
      expect(existsSync(FILE_PATH)).toBe(true);
    });

    test("new task should be added and id_count is incremented", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "Test task"]);
      const data = await Bun.file(FILE_PATH).json();
      expect(data["id_count"]).toBe(2);
      expect(data["tasks"].length).toBe(1);
    });
  });

  describe("delete command", () => {
    test("exits when an invalid argument is passed", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "Test task"]);
      await program.parseAsync(["node", "task-cli", "delete", "abc"]);
      expect(consoleSpy).toHaveBeenCalledWith("Invalid argument. A valid ID must be passed.");
    });

    test("throws error if data.json doesn't exist", async () => {
      const consoleSpy = spyOn(console, "log");
      const program = createProgram();
      expect(async () => {
        await program.parseAsync(["node", "task-cli", "delete", "1"]);
      }).toThrow("process.exit(1)");
      expect(consoleSpy).toHaveBeenCalledWith("Data file not found.");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test("deletes given task", async () => {
      console.log("hello? are you exiting here?");
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "Test task"]);
      expect(existsSync(FILE_PATH)).toBe(true);

      let data;
      data = await Bun.file(FILE_PATH).json();
      expect(data["tasks"].length).toBe(1);
      const task = data["tasks"].map((t: Task) => t.id)[0];
      await program.parseAsync(["node", "task-cli", "delete", `${task.id}`]);
      data = await Bun.file(FILE_PATH).json();
      expect(data["tasks"].find((t: Task) => t.id === task.id)).toBe(undefined);
    });

    test("throws error if user tries to delete a task that doesn't exist", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "Test task"]);
      expect(existsSync(FILE_PATH)).toBe(true);
      await program.parseAsync(["node", "task-cli", "delete", "150"]);
      expect(consoleSpy).toHaveBeenCalledWith(`${Messages.TASK_NOT_FOUND} with ID 150.`);
    });
  });

  describe("mark command", () => {
    describe("mark subcommands", () => {
      const statuses: TaskStatus[] = [Status.IN_PROGRESS, Status.DONE, Status.TODO];
      statuses.forEach((status: TaskStatus) => {
        test("exits if an invalid id is passed - " + status, async () => {
          const program = createProgram();
          await program.parseAsync(["node", "task-cli", "add", "test task"]);
          await program.parseAsync(["node", "task-cli", "mark", status, "abcd"]);
          expect(consoleSpy).toHaveBeenCalledWith("Invalid argument. A valid ID must be passed.");
        });

        test("throws error if data.json doesn't exist - " + status, async () => {
          const program = createProgram();
          expect(async () => {
            await program.parseAsync(["node", "task-cli", "mark", status, "1"])
          }).toThrow("process.exit(1)");
          expect(consoleSpy).toHaveBeenCalledWith("Data file not found.");
          expect(exitSpy).toHaveBeenCalledWith(1);
        });

        test("exits if the given id doesn't exist - " + status, async () => {
          const program = createProgram();
          await program.parseAsync(["node", "task-cli", "add", "Test task"]);
          expect(existsSync(FILE_PATH)).toBe(true);

          const data = await Bun.file(FILE_PATH).json();
          expect(data["tasks"].length).toBe(1);
          await program.parseAsync(["node", "task-cli", "mark", status, "300"]);
          expect(consoleSpy).toHaveBeenCalledWith(`${Messages.TASK_NOT_FOUND} with ID 300.`);
        });

        test(`marks task as ${status}`, async () => {
          const program = createProgram();
          await program.parseAsync(["node", "task-cli", "add", "Test task"]);
          expect(existsSync(FILE_PATH)).toBe(true);

          let data: Data;
          let task: Task;
          data = await Bun.file(FILE_PATH).json();
          expect(data["tasks"].length).toBe(1);
          task = data.tasks.map(t => t)[0];
          await program.parseAsync(["node", "task-cli", "mark", status, `${task.id}`]);
          data = await Bun.file(FILE_PATH).json();
          task = data.tasks.map(t => t)[0];
          expect(task.status).toBe(status);
        });

        test(`task already has the status ${status}`, async () => {
          const program = createProgram();
          await program.parseAsync(["node", "task-cli", "add", "Test task"]);
          expect(existsSync(FILE_PATH)).toBe(true);

          let data: Data;
          let task: Task;
          data = await Bun.file(FILE_PATH).json();
          expect(data["tasks"].length).toBe(1);
          task = data.tasks.map(t => t)[0];
          await program.parseAsync(["node", "task-cli", "mark", status, `${task.id}`]);
          await program.parseAsync(["node", "task-cli", "mark", status, `${task.id}`]);
          expect(consoleSpy).toHaveBeenCalledWith(`Task ${task.id} already has the status of ${status}.`);
        });
      });
    });
  });

  describe("update command", () => {
    test("exits if an invalid id argument is passed", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "test task"]);
      await program.parseAsync(["node", "task-cli", "update", "abc", "test update"]);
      expect(consoleSpy).toHaveBeenCalledWith("Invalid argument. A valid ID must be passed.");
    });

    test("exits if the description argument is invalid/empty", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "test task"]);
      await program.parseAsync(["node", "task-cli", "update", "1", ""]);
      expect(consoleSpy).toHaveBeenCalledWith("No task input was passed.");
    });

    test("exits if data file doesn't exist", async () => {
      const program = createProgram();
      expect(async () => {
        await program.parseAsync(["node", "task-cli", "update", "5", "task upate"]);
      }).toThrow("process.exit(1)");
      expect(consoleSpy).toHaveBeenCalledWith("Data file not found.");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test("exits if there are no tasks to update", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "task update"]);
      await program.parseAsync(["node", "task-cli", "delete", "1"]);
      expect(async () => {
        await program.parseAsync(["node", "task-cli", "update", "1", "task update"]);
      }).toThrow("process.exit(1)");
      expect(consoleSpy).toHaveBeenCalledWith(Messages.NO_TASKS_AVAILABLE);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test("exits if the task with the given id doesn't exist", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "task update"]);
      await program.parseAsync(["node", "task-cli", "update", "2", "task update"]);
      expect(consoleSpy).toHaveBeenCalledWith(`${Messages.TASK_NOT_FOUND} with ID 2.`);
    });

    test("updates task", async () => {
      const program = createProgram();
      await program.parseAsync(["node", "task-cli", "add", "new task"]);
      await program.parseAsync(["node", "task-cli", "update", "1", "task updated"]);

      const data: Data = await Bun.file(FILE_PATH).json();
      const task = data.tasks.map(t => t)[0];
      expect(task).not.toBe(undefined);
      expect(task.description).toBe("task updated");
      expect(consoleSpy).toHaveBeenCalledWith("Task 1 updated successfully.");
    });
  });

  describe("list command", () => {
    describe("list subcommands", () => {
      for (const status of Object.values(Status)) {
        test(`exits if data file doesn't exist - ${status}`, async () => {
          const program = createProgram();
          expect(async () => {
            await program.parseAsync(["node", "task-cli", "list", `${status}`]);
          }).toThrow("process.exit(1)");
          expect(consoleSpy).toHaveBeenCalledWith("Data file not found.");
          expect(exitSpy).toHaveBeenCalledWith(1);
        });

        test(`exits when there are no tasks`, async () => {
          const program = createProgram();
          await program.parseAsync(["node", "task-cli", "add", "task update"]);
          await program.parseAsync(["node", "task-cli", "delete", "1"]);
          expect(async () => {
            await program.parseAsync(["node", "task-cli", "list", `${status}`]);
          }).toThrow("process.exit(1)");
          expect(consoleSpy).toHaveBeenCalledWith(Messages.NO_TASKS_AVAILABLE);
          expect(exitSpy).toHaveBeenCalledWith(1);
        });
      }
    });
  });
});
