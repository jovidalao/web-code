import { useRouter } from "next/navigation";
import { useProjects } from "../hooks/use-projects";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ProjectStatusIcon } from "./project-status-icon";

interface ProjectsCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectsCommandDialog = ({
  open,
  onOpenChange,
}: ProjectsCommandDialogProps) => {
  const router = useRouter();
  const projects = useProjects();

  const handleSelectProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Projects"
      description="Search for a project to open"
    >
      <CommandInput placeholder="Search projects..." />
      <CommandList>
        <CommandEmpty>No projects found</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects.projects.map((project) => (
            <CommandItem
              key={project.id}
              value={`${project.name} - ${project.id}`}
              onSelect={() => handleSelectProject(project.id)}
            >
              <ProjectStatusIcon importStatus={project.import_status} />
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
