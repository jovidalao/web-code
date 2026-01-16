"use client";

import { Button } from "@/components/ui/button";
import { FilePlusCornerIcon, FolderPlusIcon } from "lucide-react";

interface FileTreeActionsProps {
  onCreateFile: () => void;
  onCreateFolder: () => void;
  className?: string;
}

export const FileTreeActions = ({
  onCreateFile,
  onCreateFolder,
  className = "",
}: FileTreeActionsProps) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onCreateFile();
        }}
        variant="highlight"
        size="icon-xs"
        title="New File"
      >
        <FilePlusCornerIcon className="size-3.5" />
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onCreateFolder();
        }}
        variant="highlight"
        size="icon-xs"
        title="New Folder"
      >
        <FolderPlusIcon className="size-3.5" />
      </Button>
    </div>
  );
};
