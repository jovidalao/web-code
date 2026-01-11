"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types/task";

const supabase = createClient();

type UseTasksOptions = {
  /** 是否启用实时订阅，默认 true */
  realtime?: boolean;
};

type UseTasksReturn = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  /** 手动刷新数据 */
  refresh: () => Promise<void>;
};

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { realtime = true } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("tasks")
      .select("id,text,created_at,is_done")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setTasks([]);
    } else {
      setTasks(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchInitial() {
      await loadTasks();
      if (cancelled) return;
    }

    fetchInitial();

    // 实时订阅
    if (!realtime) return;

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          if (!cancelled) loadTasks();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [realtime]);

  return {
    tasks,
    loading,
    error,
    refresh: loadTasks,
  };
}
