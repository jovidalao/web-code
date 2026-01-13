"use client";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { SparkleIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import { ProjectList } from "./project-list";
import { useProjects } from "../hooks/use-projects";
import { useEffect, useState } from "react";
import { ProjectsCommandDialog } from "./projects-command-dialog";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function ProjectView() {
  const { projects, loading, error, createProject } = useProjects();
  const [creating, setCreating] = useState(false);

  const onNewProject = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await createProject();
    } finally {
      setCreating(false);
    }
  };

  const [commandDialogOpen, setCommandDialogOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "k") {
          event.preventDefault();
          setCommandDialogOpen(true);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
          <div className="flex justify-between gap-4 w-full items-center">
            <div className="flex items-center gap-2 w-full group/logo">
              <Image src="/vercel.svg" alt="web code" width={32} height={32} />
              <h1
                className={cn(
                  "text-2xl md:text-3xl font-semibold",
                  font.className
                )}
              >
                Web Code
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onNewProject}
                disabled={creating}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent border">⌘J</Kbd>
                </div>
                <div className="text-sm">
                  <span>New</span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => {}}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <FaGithub className="size-4" />
                  <Kbd className="bg-accent border">⌘I</Kbd>
                </div>
                <div className="text-sm">
                  <span>Import</span>
                </div>
              </Button>
            </div>
            <ProjectList
              onViewAll={() => setCommandDialogOpen(true)}
              projects={projects}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </>
  );
}
