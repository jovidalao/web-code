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
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";

export const FileExplorer = ({
  projectId,
}: {
  projectId: Project["id"];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creatingInParent, setCreatingInParent] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { getProjectById } = useProjects();
  const { createFile, isNameTaken, getChildren, renameFile, deleteFile } = useFiles(projectId);

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

  const handleDelete = useCallback((file: File) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (fileToDelete) {
      await deleteFile(fileToDelete.id);
      setFileToDelete(null);
      setDeleteDialogOpen(false);
    }
  }, [fileToDelete, deleteFile]);

  const handleStartCreatingInFolder = useCallback(
    (parentId: string, type: FileType) => {
      setCreatingInParent(parentId);
      startCreating(type);
    },
    [startCreating]
  );

  useEffect(() => {
    const fetchProject = async () => {
      const data = await getProjectById(projectId);
      setProject(data);
    };
    fetchProject();
  }, [projectId, getProjectById]);

  const rootFiles = getChildren(null);

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

  const renderFileTree = (parentId: string | null, depth: number): React.ReactNode => {
    const children = getChildren(parentId);

    return (
      <>
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
            {file.type === "folder" && renderFileTree(file.id, depth + 1)}
          </FileTreeItem>
        ))}
      </>
    );
  };

  return (
    <div className="h-full bg-sidebar">
      <DeleteConfirmDialog
        file={fileToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
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

        {isExpanded && (
          <div key={collapseKey}>
            {renderFileTree(null, 0)}

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