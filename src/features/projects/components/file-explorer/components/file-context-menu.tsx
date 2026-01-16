"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { File } from "@/types/file";
import { FileIcon, FolderIcon, TrashIcon, PencilIcon } from "lucide-react";

interface FileContextMenuProps {
  file: File;
  children: React.ReactNode;
  onRename?: (file: File) => void;
  onDelete?: (file: File) => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}

export const FileContextMenu = ({
  file,
  children,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
}: FileContextMenuProps) => {
  const isFolder = file.type === "folder";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {/* Folder-specific actions */}
        {isFolder && (
          <>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCreateFile?.();
              }}
            >
              <FileIcon className="mr-2 h-4 w-4" />
              <span>New File</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder?.();
              }}
            >
              <FolderIcon className="mr-2 h-4 w-4" />
              <span>New Folder</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {/* Common actions */}
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRename?.(file);
          }}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(file);
          }}
          className="text-destructive focus:text-destructive"
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
