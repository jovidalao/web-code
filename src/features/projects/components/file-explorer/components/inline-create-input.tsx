"use client";

import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { FileType } from "@/types/file";
import { RefObject } from "react";
import { cn } from "@/lib/utils";

interface InlineCreateInputProps {
  type: FileType;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  error?: string | null;
}

export const InlineCreateInput = ({
  type,
  value,
  onChange,
  onKeyDown,
  onBlur,
  inputRef,
  error,
}: InlineCreateInputProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 h-6 pr-1">
        {/* Spacer for alignment with file tree */}
        <span className="size-3" />
        {type === "folder" ? (
          <FolderIcon className="size-4 shrink-0 text-muted-foreground" folderName={value} />
        ) : (
          <FileIcon className="size-4 shrink-0 text-muted-foreground" fileName={value} />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          autoFocus
          className={cn(
            "flex-1 h-[18px] text-xs px-1 py-0",
            "border rounded-none outline-none",
            "focus:ring-0",
            error
              ? "border-destructive focus:border-destructive"
              : "border-primary/50 focus:border-primary"
          )}
        />
      </div>
      {error && (
        <div
          className="ml-7 mt-0.5 text-[11px] text-[#ccc] bg-destructive border border-destructive px-1.5 py-0.5"
        >
          {error}
        </div>
      )}
    </div>
  );
};
