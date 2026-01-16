"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@/types/project";
import { useState, useEffect, useCallback } from "react";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useFiles } from "@/features/projects/hooks/use-files";
import { FileTreeHeader } from "./components/file-tree-header";
import { FileTreeItem } from "./components/file-tree-item";
import { InlineCreateInput } from "./components/inline-create-input";
import { useFileCreation } from "./hooks/use-file-creation";
import { useFileRename } from "./hooks/use-file-rename";
import { FileType, File } from "@/types/file";
import { getItemPadding } from "./constants";

export const FileExplorer = ({
  projectId,
}: {
  projectId: Project["id"];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [collapseKey, setCollapseKey] = useState(0);
  // Track which folder is currently having a new item created
  const [creatingInParent, setCreatingInParent] = useState<string | null>(null);

  const { getProjectById } = useProjects();
  const { createFile, files, isNameTaken, getChildren, renameFile, deleteFile } = useFiles(projectId);

  // Handle file/folder creation
  const handleSubmitCreate = useCallback(
    async (name: string, type: FileType, parentId?: string) => {
      await createFile({
        project_id: projectId,
        name,
        type,
        parent_id: parentId,
        content: type === "file" ? "" : undefined,
      });
      setCreatingInParent(null);
    },
    [createFile, projectId]
  );

  const {
    creating,
    newName,
    error,
    inputRef,
    startCreating,
    cancelCreating,
    setNewName,
    handleKeyDown,
    handleBlur,
  } = useFileCreation({
    onSubmit: handleSubmitCreate,
    isNameTaken,
    parentId: creatingInParent,
  });

  // Handle file/folder rename
  const handleSubmitRename = useCallback(
    async (fileId: string, newName: string) => {
      await renameFile(fileId, newName);
    },
    [renameFile]
  );

  const {
    renamingFile,
    newName: renamingName,
    error: renamingError,
    inputRef: renamingInputRef,
    startRenaming,
    cancelRenaming,
    setNewName: setRenamingName,
    handleKeyDown: handleRenamingKeyDown,
    handleBlur: handleRenamingBlur,
  } = useFileRename({
    onRename: handleSubmitRename,
    isNameTaken,
  });

  // Handle file/folder delete
  const handleDelete = useCallback(
    async (file: File) => {
      const confirmMessage = file.type === "folder"
        ? `确定要删除文件夹 "${file.name}" 及其所有内容吗？`
        : `确定要删除文件 "${file.name}" 吗？`;

      if (window.confirm(confirmMessage)) {
        await deleteFile(file.id);
      }
    },
    [deleteFile]
  );

  // Start creating in a specific parent folder
  const handleStartCreatingInFolder = useCallback(
    (parentId: string, type: FileType) => {
      setCreatingInParent(parentId);
      startCreating(type);
    },
    [startCreating]
  );

  // Fetch project info
  useEffect(() => {
    const fetchProject = async () => {
      const data = await getProjectById(projectId);
      setProject(data);
    };
    fetchProject();
  }, [projectId, getProjectById]);

  // Filter root level files (no parent_id)
  const rootFiles = getChildren(null);

  // Header actions
  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCollapseAll = () => {
    setCollapseKey((prev) => prev + 1);
    setCreatingInParent(null);
    cancelCreating();
    cancelRenaming();
  };

  const handleCreateFile = () => {
    setIsExpanded(true);
    setCreatingInParent(null);
    startCreating("file");
  };

  const handleCreateFolder = () => {
    setIsExpanded(true);
    setCreatingInParent(null);
    startCreating("folder");
  };

  // Recursive render function for file tree
  const renderFileTree = (parentId: string | null, depth: number): React.ReactNode => {
    const children = getChildren(parentId);

    return (
      <>
        {/* Show inline input if creating in this parent */}
        {creating && creatingInParent === parentId && (
          <div style={{ paddingLeft: `${getItemPadding(depth)}px` }}>
            <InlineCreateInput
              type={creating}
              value={newName}
              onChange={setNewName}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              inputRef={inputRef}
              error={error}
            />
          </div>
        )}

        {/* Render children */}
        {children.map((file: File) => (
          <FileTreeItem
            key={file.id}
            file={file}
            depth={depth}
            onCreateFile={(folderId) => handleStartCreatingInFolder(folderId, "file")}
            onCreateFolder={(folderId) => handleStartCreatingInFolder(folderId, "folder")}
            onRename={startRenaming}
            onDelete={handleDelete}
            isRenaming={renamingFile?.id === file.id}
            renamingValue={renamingName}
            renamingError={renamingError}
            onRenamingChange={setRenamingName}
            onRenamingKeyDown={handleRenamingKeyDown}
            onRenamingBlur={handleRenamingBlur}
            renamingInputRef={renamingInputRef}
          >
            {/* Recursively render children for folders */}
            {file.type === "folder" && renderFileTree(file.id, depth + 1)}
          </FileTreeItem>
        ))}
      </>
    );
  };

  return (
    <div className="h-full bg-sidebar">
      <ScrollArea>
        <FileTreeHeader
          projectName={project?.name ?? ""}
          isExpanded={isExpanded}
          isLoading={!project}
          onToggleExpand={handleToggleExpand}
          onCollapseAll={handleCollapseAll}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
        />

        {/* Expanded content with file list and new item input */}
        {isExpanded && (
          <div key={collapseKey}>
            {/* Render root level */}
            {renderFileTree(null, 0)}

            {/* Empty state */}
            {!creating && rootFiles.length === 0 && (
              <div className="text-xs text-muted-foreground px-5 py-2">
                No files yet
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};