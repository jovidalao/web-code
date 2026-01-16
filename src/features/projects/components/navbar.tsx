"use client";
import { Project } from "@/types/project";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { UserNavAvatar } from "@/components/user-nav-avatar";
import { useProjects } from "../hooks/use-projects";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, CloudCheckIcon, LoaderIcon } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function Navbar({ projectId }: { projectId: Project["id"] }) {
  const { getProjectById, updateProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const handleSubmit = async () => {
    if (!project) return;
    setIsRenaming(false);
    const trimmedName = projectName?.trim();
    if (!trimmedName || trimmedName === project.name) return;

    const previousName = project.name;
    setProject({ ...project, name: trimmedName });

    const updated = await updateProject(project.id, { name: trimmedName });
    if (updated) {
      setProject(updated);
    } else {
      setProject({ ...project, name: previousName });
    }
  };

  const handleRename = () => {
    if (!project) return;
    setProjectName(project.name);
    setIsRenaming(true);
  };

  useEffect(() => {
    getProjectById(projectId).then(setProject);
  }, [projectId, getProjectById]);

  return (
    <nav className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="flex items-center gap-1.5">
                <Button variant="ghost" className="w-fit p-1.5 h-7" asChild>
                  <Link href="/">
                    <Image
                      src="/vercel.svg"
                      alt="web code"
                      width={20}
                      height={20}
                    />
                    <span className={cn(font.className, "text-sm font-medium")}>
                      Web Code
                    </span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="ml-0 mr-1" />
            <BreadcrumbItem>
              {isRenaming ? (
                <Input
                  autoFocus
                  type="text"
                  value={projectName ?? ""}
                  onChange={(e) => setProjectName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onBlur={handleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-50 truncate border-none"
                />
              ) : (
                <BreadcrumbPage
                  className="text-sm cursor-pointer font-medium hover:text-primary max-w-40 truncate"
                  onClick={() => handleRename()}
                >
                  {project?.name ?? "No project name"}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {project?.import_status === "importing" ? (
          <Tooltip>
            <TooltipTrigger>
              <LoaderIcon className="size-4 animate-spin" />
            </TooltipTrigger>
            <TooltipContent>Importing project...</TooltipContent>
          </Tooltip>
        ) : (
          project?.created_at && (
            <Tooltip onOpenChange={() => forceUpdate((n) => n + 1)}>
              <TooltipTrigger>
                <CloudCheckIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Saved{" "}
                {formatDistanceToNowStrict(project.updated_at, {
                  addSuffix: true,
                })}
              </TooltipContent>
            </Tooltip>
          )
        )}
      </div>
      <div className="flex items-center gap-x-2">
        <UserNavAvatar />
      </div>
    </nav>
  );
}

export default Navbar;
