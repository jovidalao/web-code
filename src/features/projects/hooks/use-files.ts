import { useCallback, useEffect } from "react";

import { CreateFileInput, File, UpdateFileInput } from "@/types/file";
import { EMPTY_PROJECT_STATE, useFilesStore } from "@/features/projects/store/use-files-store";

export const useFiles = (projectId: string) => {
  const projectState = useFilesStore(
    (state) => state.projects.get(projectId) ?? EMPTY_PROJECT_STATE
  );
  const fetchFiles = useFilesStore((state) => state.fetchFiles);
  const createFileAction = useFilesStore((state) => state.createFile);
  const updateFileAction = useFilesStore((state) => state.updateFile);
  const deleteFileAction = useFilesStore((state) => state.deleteFile);

  const { files, loading, error, fetched } = projectState;

  useEffect(() => {
    if (!projectId) return;
    if (!fetched && !loading) {
      fetchFiles(projectId);
    }
  }, [projectId, fetched, loading, fetchFiles]);

  const createFile = useCallback(
    async (input: CreateFileInput) => {
      return createFileAction(projectId, input);
    },
    [createFileAction, projectId]
  );

  const updateFile = useCallback(
    async (id: string, updates: UpdateFileInput) => {
      return updateFileAction(projectId, id, updates);
    },
    [updateFileAction, projectId]
  );

  const deleteFile = useCallback(
    async (id: string) => {
      return deleteFileAction(projectId, id);
    },
    [deleteFileAction, projectId]
  );

  const getFileById = useCallback(
    async (id: File["id"]) => {
      return files.find((file) => file.id === id) ?? null;
    },
    [files]
  );

  const getChildren = useCallback(
    (parentId: string | null) => {
      return files.filter((file) =>
        parentId === null ? !file.parent_id : file.parent_id === parentId
      );
    },
    [files]
  );

  const moveFile = useCallback(
    async (id: string, newParentId: string | null) => {
      return updateFile(id, { parent_id: newParentId ?? undefined });
    },
    [updateFile]
  );

  const renameFile = useCallback(
    async (id: string, newName: string) => {
      return updateFile(id, { name: newName });
    },
    [updateFile]
  );

  const isNameTaken = useCallback(
    (name: string, parentId: string | null, excludeId?: string) => {
      return files.some(
        (file) =>
          file.name.toLowerCase() === name.toLowerCase() &&
          (parentId === null
            ? !file.parent_id
            : file.parent_id === parentId) &&
          file.id !== excludeId
      );
    },
    [files]
  );

  const buildTree = useCallback(() => {
    const rootFiles = files.filter((file) => !file.parent_id);

    const buildNode = (file: File): File & { children: File[] } => {
      const children = files.filter((child) => child.parent_id === file.id);
      return {
        ...file,
        children: children.map(buildNode),
      };
    };

    return rootFiles.map(buildNode);
  }, [files]);

  const getFilePath = useCallback(
    (fileId: File["id"]): File[] => {
      const path: File[] = [];
      let currentId: File["id"] | null | undefined = fileId;

      while (currentId) {
        const file = files.find((candidate) => candidate.id === currentId);
        if (!file) break;

        path.unshift(file);
        currentId = file.parent_id;
      }

      return path;
    },
    [files]
  );

  return {
    files,
    loading,
    error,
    createFile,
    updateFile,
    deleteFile,
    getFileById,
    getChildren,
    getFilePath,
    moveFile,
    renameFile,
    isNameTaken,
    buildTree,
    refetch: () => fetchFiles(projectId),
  };
};
