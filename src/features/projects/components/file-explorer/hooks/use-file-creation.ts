import { useState, useCallback } from "react";
import { FileType } from "@/types/file";
import { useInlineInput } from "./use-inline-input";

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

  const handleCreate = useCallback(
    async (name: string) => {
      await onSubmit(name, creating!, parentId ?? undefined);
    },
    [onSubmit, creating, parentId]
  );

  const cancelCreating = useCallback(() => {
    setCreating(null);
  }, []);

  const validate = useCallback(
    (name: string) => {
      if (isNameTaken(name, parentId)) {
        return "Name already exists";
      }
      return null;
    },
    [isNameTaken, parentId]
  );

  const {
    value: newName,
    setValue: setNewName,
    error,
    inputRef,
    handleKeyDown,
    handleBlur,
  } = useInlineInput({
    onSubmit: handleCreate,
    onCancel: cancelCreating,
    validate,
    active: creating !== null,
  });

  const startCreating = useCallback((type: FileType) => {
    setCreating(type);
  }, []);

  return {
    creating,
    newName,
    error,
    inputRef,
    startCreating,
    cancelCreating,
    setNewName,
    handleKeyDown,
    handleBlur,
  };
};
