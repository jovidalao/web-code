import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types/project";
import { useEffect, useState, useCallback } from "react";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", session.session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error.message, {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setError(error.message);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }, [supabase]);

  // Create project
  const createProject = async (name?: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

    const trimmedName = name?.trim();
    const finalName =
      trimmedName && trimmedName.length > 0
        ? trimmedName
        : uniqueNamesGenerator({
            dictionaries: [adjectives, animals, colors],
            separator: "-",
            length: 3,
          });

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: finalName,
        owner_id: session.session.user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error.message, {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setError(error.message);
      return null;
    }

    setProjects((prev) => [data, ...prev]);
    return data;
  };

  // Update project
  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error.message, {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setError(error.message);
      return null;
    }

    setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  // Delete project
  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting project:", error.message, {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setError(error.message);
      return false;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  useEffect(() => {
    // Avoid triggering setState synchronously in effect
    // Use a microtask to ensure it's async and doesn't cause cascading renders
    const timeout = setTimeout(() => {
      fetchProjects();
    }, 0);

    return () => clearTimeout(timeout);
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};
