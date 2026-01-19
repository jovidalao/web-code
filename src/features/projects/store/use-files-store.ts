import { create } from "zustand";

import { createClient } from "@/lib/supabase/client";
import { CreateFileInput, File, UpdateFileInput } from "@/types/file";
import { Project } from "@/types/project";

type ProjectFilesState = {
  files: File[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
};

type FilesStore = {
  projects: Map<Project["id"], ProjectFilesState>;
  fetchFiles: (projectId: Project["id"]) => Promise<void>;
  createFile: (
    projectId: Project["id"],
    input: CreateFileInput
  ) => Promise<File | null>;
  updateFile: (
    projectId: Project["id"],
    id: File["id"],
    updates: UpdateFileInput
  ) => Promise<File | null>;
  deleteFile: (projectId: Project["id"], id: File["id"]) => Promise<boolean>;
};

export const EMPTY_PROJECT_STATE: ProjectFilesState = {
  files: [],
  loading: false,
  error: null,
  fetched: false,
};

const createEmptyProjectState = (): ProjectFilesState => ({
  files: [],
  loading: false,
  error: null,
  fetched: false,
});

const normalizeUpdatedAt = (value: File["updated_at"]) => {
  const numeric =
    typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numeric)) return value;
  return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
};

const normalizeFile = (file: File): File => ({
  ...file,
  updated_at: normalizeUpdatedAt(file.updated_at),
});

const normalizeFiles = (files: File[]) => files.map(normalizeFile);

export const useFilesStore = create<FilesStore>((set, get) => {
  const setProjectState = (
    projectId: Project["id"],
    partial: Partial<ProjectFilesState>
  ) => {
    set((state) => {
      const projects = new Map(state.projects);
      const current = projects.get(projectId) ?? createEmptyProjectState();
      projects.set(projectId, { ...current, ...partial });
      return { projects };
    });
  };

  return {
    projects: new Map(),
    fetchFiles: async (projectId) => {
      if (!projectId) return;
      const current = get().projects.get(projectId);
      if (current?.loading) return;

      setProjectState(projectId, { loading: true, error: null });

      const supabase = createClient();
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching files:", error.message, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setProjectState(projectId, {
          loading: false,
          error: error.message,
          fetched: true,
        });
        return;
      }

      setProjectState(projectId, {
        files: normalizeFiles(data || []),
        loading: false,
        error: null,
        fetched: true,
      });
    },

    createFile: async (projectId, input) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("files")
        .insert({
          ...input,
          project_id: projectId,
          updated_at: Date.now(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating file:", error.message, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setProjectState(projectId, { error: error.message });
        return null;
      }

      const normalized = normalizeFile(data);

      set((state) => {
        const projects = new Map(state.projects);
        const current = projects.get(projectId) ?? createEmptyProjectState();
        projects.set(projectId, {
          ...current,
          files: [...current.files, normalized],
          error: null,
        });
        return { projects };
      });

      return normalized;
    },

    updateFile: async (projectId, id, updates) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("files")
        .update({ ...updates, updated_at: Date.now() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating file:", error.message, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setProjectState(projectId, { error: error.message });
        return null;
      }

      const normalized = normalizeFile(data);

      set((state) => {
        const projects = new Map(state.projects);
        const current = projects.get(projectId) ?? createEmptyProjectState();
        projects.set(projectId, {
          ...current,
          files: current.files.map((file) =>
            file.id === id ? normalized : file
          ),
          error: null,
        });
        return { projects };
      });

      return normalized;
    },

    deleteFile: async (projectId, id) => {
      const current = get().projects.get(projectId) ?? createEmptyProjectState();

      const getDescendantIds = (parentId: string): string[] => {
        const children = current.files.filter((f) => f.parent_id === parentId);
        return children.flatMap((child) => [
          child.id,
          ...getDescendantIds(child.id),
        ]);
      };

      const idsToDelete = [id, ...getDescendantIds(id)];

      const supabase = createClient();
      const { error } = await supabase
        .from("files")
        .delete()
        .in("id", idsToDelete);

      if (error) {
        console.error("Error deleting file:", error.message, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setProjectState(projectId, { error: error.message });
        return false;
      }

      set((state) => {
        const projects = new Map(state.projects);
        const existing = projects.get(projectId) ?? createEmptyProjectState();
        projects.set(projectId, {
          ...existing,
          files: existing.files.filter(
            (file) => !idsToDelete.includes(file.id)
          ),
          error: null,
        });
        return { projects };
      });

      return true;
    },
  };
});
