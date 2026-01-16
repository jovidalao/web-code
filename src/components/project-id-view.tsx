"use client";

import { FileExplorer } from "@/features/projects/components/file-explorer";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { Allotment } from "allotment";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

const DEFAULT_SIDEBAR_WIDTH = 250;
const DEFAULT_MAIN_WIDTH = 1000;
const MIN_SIDEBAR_WIDTH = 150;
const MAX_SIDEBAR_WIDTH = 400;

const Tab = ({
  lable,
  isActive,
  onClick,
}: {
  lable: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-b hover:bg-accent/30",
        isActive && "bg-background text-foreground"
      )}
    >
      <span className="text-sm">{lable}</span>
    </div>
  );
};

export const ProjectIdView = ({ projectId }: { projectId: Project["id"] }) => {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  return (
    <div className="h-full flex flex-col">
      <nav className="h-9 flex items-center bg-sidebar border-b">
        <Tab
          lable="Code"
          isActive={activeTab === "code"}
          onClick={() => setActiveTab("code")}
        />
        <Tab
          lable="Preview"
          isActive={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
        />
        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
            <FaGithub className="size-3.5" />
            <span className="text-sm">Export</span>
          </div>
        </div>
      </nav>
      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            activeTab === "code" ? "visible" : "invisible"
          )}
        >
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_WIDTH]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              <p>Code Editor</p>
            </Allotment.Pane>
          </Allotment>
        </div>
        <div
          className={cn(
            "absolute inset-0",
            activeTab === "preview" ? "visible" : "invisible"
          )}
        >
          <div>Preview</div>
        </div>
      </div>
    </div>
  );
};
