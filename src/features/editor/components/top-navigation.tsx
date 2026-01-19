import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEditor } from "../hooks/use-editor";
import { ScrollBar } from "@/components/ui/scroll-area";
import { File } from "@/types/file";
import { useFiles } from "@/features/projects/hooks/use-files";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { FileIcon } from "@react-symbols/icons/utils";
import { X } from "lucide-react";

const Tab = ({ fileId, isFirst, projectId }: { fileId: File["id"], isFirst: boolean, projectId: string }) => {
  const { files } = useFiles(projectId);
  const {
    activeTabId,
    previewTabId,
    setActiveTab,
    openTabs,
    closeTab,
    openFile
  } = useEditor(projectId);

  const file = files.find((f) => f.id === fileId);
  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file?.name ?? "Loading...";

  return (
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "flex items-center gap-2 h-8.5 pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:bg-accent/30",
        isActive && "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow",
        isFirst && "border-l-transparent!"
      )}
    >
      {
        file === undefined ? (
          <Spinner className="text-ring" />
        ) : (
          <FileIcon fileName={fileName} autoAssign className="size-4" />
        )
      }
      <span className={cn("text-sm whitespace-nowrap", isPreview && "italic")}>{fileName}</span>
      <button
        onClick={() => closeTab(fileId)}
        className="ml-auto size-4 opacity-0 group-hover:opacity-100 hover:bg-accent"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export const TopNavigation = ({ projectId }: { projectId: string }) => {
  const { openTabs } = useEditor(projectId);

  return (
    <ScrollArea className="flex-1">
      <nav className="bg-sidebar flex items-center h-8.5 border-b">
        {openTabs.map((fileId, index) => (
          <Tab key={fileId}
            fileId={fileId}
            isFirst={index === 0}
            projectId={projectId}
          />
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};