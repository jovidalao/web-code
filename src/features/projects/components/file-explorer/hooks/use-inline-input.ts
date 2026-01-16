import { useState, useRef, useEffect, useCallback } from "react";

interface UseInlineInputProps {
  onSubmit: (value: string) => Promise<void> | void;
  onCancel?: () => void;
  validate?: (value: string) => string | null;
  selectRange?: [number, number] | "all";
  active?: boolean;
}

export const useInlineInput = ({
  onSubmit,
  onCancel,
  validate,
  selectRange = "all",
  active = true,
}: UseInlineInputProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select when active
  useEffect(() => {
    if (active && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        if (selectRange === "all") {
          inputRef.current?.select();
        } else {
          inputRef.current?.setSelectionRange(selectRange[0], selectRange[1]);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [active, selectRange]);

  const reset = useCallback(() => {
    setValue("");
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();

    if (!trimmed) {
      onCancel?.();
      reset();
      return;
    }

    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      await onSubmit(trimmed);
      reset();
    } catch (err) {
      setError("Operation failed");
      console.error("Submit error:", err);
    }
  }, [value, validate, onSubmit, onCancel, reset]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
        reset();
      }
    },
    [handleSubmit, onCancel, reset]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (value.trim()) {
        handleSubmit();
      } else {
        onCancel?.();
        reset();
      }
    }, 100);
  }, [value, handleSubmit, onCancel, reset]);

  return {
    value,
    setValue,
    error,
    setError,
    inputRef,
    reset,
    handleKeyDown,
    handleBlur,
  };
};
