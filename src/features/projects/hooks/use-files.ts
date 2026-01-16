import { createClient } from "@/lib/supabase/client";
import { File, CreateFileInput, UpdateFileInput } from "@/types/file";
import { useEffect, useState, useCallback } from "react";

export const useFiles = (projectId: string) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch all files for the project
  const fetchFiles = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("project_id", projectId)
      .order("type", { ascending: true }) // folders first
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching files:", error.message, {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setError(error.message);
    } else {
      setFiles(data || []);
    }

    setLoading(false);
  }, [supabase, projectId]);

  // Get file by id
  const getFileById = useCallback(
    async (id: File["id"]) => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error getting file by id:", error.message, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setError(error.message);
        return null;
      }
      return data;
    },
    [supabase]
  );

  // Get children of a folder (from local state)
  const getChildren = useCallback(
    (parentId: string | null) => {
      return files.filter((f) =>
        parentId === null ? !f.parent_id : f.parent_id === parentId
      );
    },
    [files]
  );

  // Create file or folder
  const createFile = useCallback(
    async (input: CreateFileInput) => {
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
        setError(error.message);
        return null;
      }

      setFiles((prev) => [...prev, data]);
      return data;
    },
    [supabase, projectId]
  );

  // Update file
  const updateFile = useCallback(
    async (id: string, updates: UpdateFileInput) => {
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
        setError(error.message);
        return null;
      }

      setFiles((prev) => prev.map((f) => (f.id === id ? data : f)));
      return data;
    },
    [supabase]
  );

  // Delete file (and children if folder)
  const deleteFile = useCallback(
    async (id: string) => {
      // Get all descendant ids to delete
      const getDescendantIds = (parentId: string): string[] => {
        const children = files.filter((f) => f.parent_id === parentId);
        return children.flatMap((child) => [
          child.id,
          ...getDescendantIds(child.id),
        ]);
      };

      const idsToDelete = [id, ...getDescendantIds(id)];

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
        setError(error.message);
        return false;
      }

      setFiles((prev) => prev.filter((f) => !idsToDelete.includes(f.id)));
      return true;
    },
    [supabase, files]
  );

  // Move file to a different parent
  const moveFile = useCallback(
    async (id: string, newParentId: string | null) => {
      return updateFile(id, { parent_id: newParentId ?? undefined });
    },
    [updateFile]
  );

  // Rename file
  const renameFile = useCallback(
    async (id: string, newName: string) => {
      return updateFile(id, { name: newName });
    },
    [updateFile]
  );

  // Check if name exists in the same folder
  const isNameTaken = useCallback(
    (name: string, parentId: string | null, excludeId?: string) => {
      return files.some(
        (f) =>
          f.name.toLowerCase() === name.toLowerCase() &&
          (parentId === null ? !f.parent_id : f.parent_id === parentId) &&
          f.id !== excludeId
      );
    },
    [files]
  );

  // Build tree structure from flat files
  const buildTree = useCallback(() => {
    const rootFiles = files.filter((f) => !f.parent_id);

    const buildNode = (file: File): File & { children: File[] } => {
      const children = files.filter((f) => f.parent_id === file.id);
      return {
        ...file,
        children: children.map(buildNode),
      };
    };

    return rootFiles.map(buildNode);
  }, [files]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFiles();
    }, 0);

    return () => clearTimeout(timeout);
  }, [fetchFiles]);

  return {
    files,
    loading,
    error,
    // CRUD
    createFile,
    updateFile,
    deleteFile,
    getFileById,
    // Helpers
    getChildren,
    moveFile,
    renameFile,
    isNameTaken,
    buildTree,
    refetch: fetchFiles,
  };
};
