import { useState, useCallback, useRef, useEffect } from "react";
import { File } from "@/types/file";

interface UseFileRenameProps {
  onRename: (fileId: string, newName: string) => Promise<void>;
  isNameTaken: (name: string, parentId: string | null, excludeId?: string) => boolean;
}

export const useFileRename = ({ onRename, isNameTaken }: UseFileRenameProps) => {
  const [renamingFile, setRenamingFile] = useState<File | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when renaming starts
  useEffect(() => {
    if (renamingFile && inputRef.current) {
      inputRef.current.focus();
      // Select the name without extension
      const dotIndex = renamingFile.name.lastIndexOf(".");
      if (dotIndex > 0 && renamingFile.type === "file") {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [renamingFile]);

  const startRenaming = useCallback((file: File) => {
    setRenamingFile(file);
    setNewName(file.name);
    setError(null);
  }, []);

  const cancelRenaming = useCallback(() => {
    setRenamingFile(null);
    setNewName("");
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!renamingFile || !newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    const trimmedName = newName.trim();

    // Check if name is the same
    if (trimmedName === renamingFile.name) {
      cancelRenaming();
      return;
    }

    // Check if name is taken
    if (isNameTaken(trimmedName, renamingFile.parent_id ?? null, renamingFile.id)) {
      setError("Name already exists");
      return;
    }

    try {
      await onRename(renamingFile.id, trimmedName);
      cancelRenaming();
    } catch (err) {
      setError("Rename failed");
      console.error("Rename error:", err);
    }
  }, [renamingFile, newName, isNameTaken, onRename, cancelRenaming]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelRenaming();
      }
    },
    [handleSubmit, cancelRenaming]
  );

  const handleBlur = useCallback(() => {
    // Small delay to allow click events to fire first
    setTimeout(() => {
      if (renamingFile) {
        handleSubmit();
      }
    }, 100);
  }, [renamingFile, handleSubmit]);

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
