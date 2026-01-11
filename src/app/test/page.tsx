"use client";

import { useTasks } from "@/hooks/use-tasks";
import { TaskList } from "@/components/task-list";

export default function Page() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return <TaskList tasks={tasks} />;
}
