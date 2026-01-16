"use client";

import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { ChevronRightIcon } from "lucide-react";
import { File } from "@/types/file";
import { cn } from "@/lib/utils";
import { useState, RefObject } from "react";
import { FileTreeActions } from "./file-tree-actions";
import { FileContextMenu } from "./file-context-menu";
import { InlineCreateInput } from "./inline-create-input";
import { getItemPadding } from "../constants";

interface FileTreeItemProps {
  file: File;
  depth?: number;
  onSelect?: (file: File) => void;
  onCreateFile?: (parentId: string) => void;
  onCreateFolder?: (parentId: string) => void;
  onRename?: (file: File) => void;
  onDelete?: (file: File) => void;
  children?: React.ReactNode;
  // Rename state
  isRenaming?: boolean;
  renamingValue?: string;
  renamingError?: string | null;
  onRenamingChange?: (value: string) => void;
  onRenamingKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRenamingBlur?: () => void;
  renamingInputRef?: RefObject<HTMLInputElement | null>;
}

export const FileTreeItem = ({
  file,
  depth = 0,
  onSelect,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  children,
  isRenaming = false,
  renamingValue = "",
  renamingError = null,
  onRenamingChange,
  onRenamingKeyDown,
  onRenamingBlur,
  renamingInputRef,
}: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = file.type === "folder";

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded((prev) => !prev);
    }
    onSelect?.(file);
  };

  const handleCreateFile = () => {
    setIsExpanded(true);
    onCreateFile?.(file.id);
  };

  const handleCreateFolder = () => {
    setIsExpanded(true);
    onCreateFolder?.(file.id);
  };

  return (
    <div>
      <FileContextMenu
        file={file}
        onRename={onRename}
        onDelete={onDelete}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
      >
        {isRenaming ? (
          // Show rename input
          <div style={{ paddingLeft: `${getItemPadding(depth)}px` }}>
            <InlineCreateInput
              type={file.type}
              value={renamingValue}
              onChange={onRenamingChange || (() => { })}
              onKeyDown={onRenamingKeyDown || (() => { })}
              onBlur={onRenamingBlur || (() => { })}
              inputRef={renamingInputRef || { current: null }}
              error={renamingError}
            />
          </div>
        ) : (
          // Show normal item
          <div
            role="button"
            onClick={handleClick}
            className="group/item flex items-center gap-1 h-6 px-1 hover:bg-accent/50 cursor-pointer text-xs"
            style={{ paddingLeft: `${getItemPadding(depth)}px` }}
          >
            {isFolder ? (
              <>
                <ChevronRightIcon
                  className={cn(
                    "size-3 shrink-0 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
                <FolderIcon className="size-4 shrink-0 text-muted-foreground" folderName={file.name} />
              </>
            ) : (
              <>
                <span className="size-3" /> {/* spacer for alignment */}
                <FileIcon className="size-4 shrink-0 text-muted-foreground" fileName={file.name} />
              </>
            )}
            <span className="truncate flex-1">{file.name}</span>

            {/* Show action buttons for folders on hover */}
            {isFolder && (
              <FileTreeActions
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                className="opacity-0 group-hover/item:opacity-100 transition-none"
              />
            )}
          </div>
        )}
      </FileContextMenu>

      {/* Render children when expanded */}
      {isFolder && isExpanded && children && (
        <div>{children}</div>
      )}
    </div>
  );
};

