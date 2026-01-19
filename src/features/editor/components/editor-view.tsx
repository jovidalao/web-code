import Image from "next/image";
import { useEditor } from "../hooks/use-editor";
import { useFiles } from "@/features/projects/hooks/use-files";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { TopNavigation } from "./top-navigation";
import { CodeEditor } from "./code-editor";
import { useRef } from "react";

const DEBOUNCE_TIMEOUT = 1500;

export const EditorView = ({ projectId }: { projectId: string }) => {
  const { activeTabId } = useEditor(projectId);
  const { files, updateFile } = useFiles(projectId);

  const activeFile = files.find(f => f.id === activeTabId);
  const fileName = activeFile?.name ?? "";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActiveFileBinary = activeFile && activeFile.storage_id
  const isActiveFileText = activeFile && !activeFile.storage_id

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
      {activeTabId && <FileBreadcrumbs projectId={projectId} fileId={activeTabId} />}
      <div className="flex-1 min-h-0 bg-background">
        {
          !activeFile && (
            <div className="size-full flex items-center justify-center">
              <Image src="/vercel.svg" alt="Web Code" width={50} height={50} className="opacity-25" />
            </div>
          )
        }
        {
          isActiveFileText && (
            <CodeEditor
              key={activeTabId}
              fileName={fileName}
              content={activeFile.content ?? ""}
              onChange={(content: string) => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                  updateFile(activeFile.id, { content });
                }, DEBOUNCE_TIMEOUT);
              }}
            />
          )
        }
        {
          isActiveFileBinary && (
            <div className="size-full flex items-center justify-center">
              <Image src="/vercel.svg" alt="Web Code" width={50} height={50} className="opacity-25" />
            </div>
          )
        }
      </div>
    </div>
  );
};
