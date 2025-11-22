/**
 * Finds task with the given id.
 * If the task isn't found, undefined is returned to be handled
 * By whoever calls this function
 *
 * @param tasks List of tasks
 * @param id id of the task to find
 * @returns the found task or undefined if no task is found
 */
const findTask = (tasks: Task[], id: number) => tasks.find(t => t.id === id);
export default findTask;
