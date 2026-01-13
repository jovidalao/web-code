import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { AlertCircleIcon, GlobeIcon, Loader2Icon } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export interface ProjectStatusIconProps {
  importStatus?: Project["import_status"];
  className?: string;
}

export function ProjectStatusIcon({
  importStatus,
  className,
}: ProjectStatusIconProps) {
  const baseClassName = cn("size-3.5 text-muted-foreground", className);

  if (importStatus === "completed") {
    return <FaGithub className={baseClassName} />;
  }

  if (importStatus === "failed") {
    return <AlertCircleIcon className={baseClassName} />;
  }

  if (importStatus === "importing") {
    return <Loader2Icon className={cn(baseClassName, "animate-spin")} />;
  }

  return <GlobeIcon className={baseClassName} />;
}

