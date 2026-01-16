"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, CopyMinusIcon } from "lucide-react";
import { FileTreeActions } from "./file-tree-actions";

interface FileTreeHeaderProps {
  projectName: string;
  isExpanded: boolean;
  isLoading?: boolean;
  onToggleExpand: () => void;
  onCollapseAll: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
}

export const FileTreeHeader = ({
  projectName,
  isExpanded,
  isLoading = false,
  onToggleExpand,
  onCollapseAll,
  onCreateFile,
  onCreateFolder,
}: FileTreeHeaderProps) => {
  return (
    <div
      role="button"
      onClick={onToggleExpand}
      className="flex group/project cursor-pointer w-full text-left items-center gap-0.5 h-5.5 bg-accent font-bold"
    >
      <ChevronRightIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          isExpanded && "rotate-90"
        )}
      />
      <p className="text-xs line-clamp-1 uppercase text-accent-foreground">
        {isLoading ? "Loading..." : projectName}
      </p>
      <div className="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
        <FileTreeActions
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
        />
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onCollapseAll();
          }}
          variant="highlight"
          size="icon-xs"
          title="Collapse All"
        >
          <CopyMinusIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
