"use client";

import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

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
          <div>Code Editor</div>
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
