import { useState, useRef, useEffect, useCallback } from "react";
import { FileType } from "@/types/file";

interface UseFileCreationProps {
  onSubmit: (name: string, type: FileType, parentId?: string) => Promise<void>;
  isNameTaken: (name: string, parentId: string | null) => boolean;
  parentId?: string | null;
}

export const useFileCreation = ({
  onSubmit,
  isNameTaken,
  parentId = null,
}: UseFileCreationProps) => {
  const [creating, setCreating] = useState<FileType | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when creating mode is activated
  useEffect(() => {
    if (creating) {
      // Small delay to ensure DOM is rendered (especially when folder expands)
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [creating]);

  const startCreating = useCallback((type: FileType) => {
    setCreating(type);
    setNewName("");
    setError(null);
  }, []);

  const cancelCreating = useCallback(() => {
    setCreating(null);
    setNewName("");
    setError(null);
  }, []);

  const handleCreate = useCallback(async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      cancelCreating();
      return;
    }

    // Check if name already exists
    if (isNameTaken(trimmedName, parentId)) {
      setError("Name already exists");
      return;
    }

    await onSubmit(trimmedName, creating!, parentId ?? undefined);
    cancelCreating();
  }, [newName, creating, parentId, isNameTaken, onSubmit, cancelCreating]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCreate();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelCreating();
      }
    },
    [handleCreate, cancelCreating]
  );

  const handleBlur = useCallback(() => {
    // Submit on blur if there's a valid name, otherwise cancel
    if (newName.trim()) {
      handleCreate();
    } else {
      cancelCreating();
    }
  }, [newName, handleCreate, cancelCreating]);

  return {
    // State
    creating,
    newName,
    error,
    inputRef,
    // Actions
    startCreating,
    cancelCreating,
    setNewName,
    // Handlers
    handleKeyDown,
    handleBlur,
  };
};
