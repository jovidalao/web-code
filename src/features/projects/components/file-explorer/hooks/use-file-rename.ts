import { useState, useCallback, useMemo, useEffect } from "react";
import { File } from "@/types/file";
import { useInlineInput } from "./use-inline-input";

interface UseFileRenameProps {
  onRename: (fileId: string, newName: string) => Promise<void>;
  isNameTaken: (name: string, parentId: string | null, excludeId?: string) => boolean;
}

export const useFileRename = ({ onRename, isNameTaken }: UseFileRenameProps) => {
  const [renamingFile, setRenamingFile] = useState<File | null>(null);

  const handleSubmit = useCallback(
    async (name: string) => {
      if (!renamingFile) return;

      // Skip if name unchanged
      if (name === renamingFile.name) {
        setRenamingFile(null);
        return;
      }

      await onRename(renamingFile.id, name);
      setRenamingFile(null);
    },
    [renamingFile, onRename]
  );

  const cancelRenaming = useCallback(() => {
    setRenamingFile(null);
  }, []);

  const validate = useCallback(
    (name: string) => {
      if (!renamingFile) return null;
      if (name === renamingFile.name) return null;
      if (isNameTaken(name, renamingFile.parent_id ?? null, renamingFile.id)) {
        return "Name already exists";
      }
      return null;
    },
    [renamingFile, isNameTaken]
  );

  // Calculate selection range for file rename (select name without extension)
  const selectRange = useMemo((): [number, number] | "all" => {
    if (!renamingFile) return "all";
    if (renamingFile.type === "folder") return "all";

    const dotIndex = renamingFile.name.lastIndexOf(".");
    if (dotIndex > 0) {
      return [0, dotIndex];
    }
    return "all";
  }, [renamingFile]);

  const {
    value: newName,
    setValue: setNewName,
    error,
    inputRef,
    handleKeyDown,
    handleBlur,
  } = useInlineInput({
    onSubmit: handleSubmit,
    onCancel: cancelRenaming,
    validate,
    selectRange,
    active: renamingFile !== null,
  });

  // Sync initial value when renamingFile changes
  useEffect(() => {
    if (renamingFile) {
      setNewName(renamingFile.name);
    }
  }, [renamingFile, setNewName]);

  const startRenaming = useCallback((file: File) => {
    setRenamingFile(file);
  }, []);

  return {
    renamingFile,
    newName,
    error,
    inputRef,
    startRenaming,
    cancelRenaming,
    setNewName,
    handleKeyDown,
    handleBlur,
  };
};
