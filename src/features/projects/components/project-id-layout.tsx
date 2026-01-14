"use client";

import { Project } from "@/types/project";
import Navbar from "./navbar";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
const DEFAULT_MAIN_WIDTH = 1000;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;

export const ProjectIdLayout = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: Project["id"];
}) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar projectId={projectId} />
      <Allotment
        defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_WIDTH]}
        className="flex-1"
      >
        <Allotment.Pane
          snap
          minSize={MIN_SIDEBAR_WIDTH}
          maxSize={MAX_SIDEBAR_WIDTH}
          preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
        >
          <div>Conversation Sidebar</div>
        </Allotment.Pane>
        <Allotment.Pane>{children}</Allotment.Pane>
      </Allotment>
    </div>
  );
};
