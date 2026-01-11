import type { Task } from "@/types/task";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="text-muted-foreground">暂无任务</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

type TaskItemProps = {
  task: Task;
};

function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="border-2 rounded-md p-2">
      <div>{task.text}</div>
      <div>Is done: {task.is_done ? "Yes" : "No"}</div>
    </div>
  );
}
