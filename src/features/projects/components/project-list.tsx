import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { Project } from "@/types/project";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { ProjectStatusIcon } from "./project-status-icon";

const MAX_RECENT_PROJECTS = 10;

interface ProjectListProps {
  onViewAll: () => void;
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const formatTimestamp = (timestamp: string) => {
  return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
};

const ContinueCard = ({ project }: { project: Project }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">Last updated</span>
      <Button
        variant="outline"
        asChild
        className="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2"
      >
        <Link href={`/projects/${project.id}`} className="group">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ProjectStatusIcon importStatus={project.import_status} />
              <span className="truncate font-medium">{project.name}</span>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(project.updated_at)}
          </span>
        </Link>
      </Button>
    </div>
  );
};

const ProjectItem = ({ project }: { project: Project }) => {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center justify-between w-full group"
    >
      <div className="flex items-center gap-2">
        <ProjectStatusIcon importStatus={project.import_status} />
        <span className="truncate">{project.name}</span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {formatTimestamp(project.updated_at)}
      </span>
    </Link>
  );
};

export const ProjectList = ({
  onViewAll,
  projects,
  loading,
  error,
}: ProjectListProps) => {
  if (loading) {
    return <Spinner className="size-4 text-ring" />;
  }
  const [mostRecent, ...rest] = projects;
  const visibleRecentProjects = rest.slice(0, MAX_RECENT_PROJECTS);
  return (
    <div className="flex flex-col gap-4">
      {error && <div className="text-xs text-destructive">{error}</div>}
      {mostRecent && <ContinueCard project={mostRecent} />}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Recent Projects
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              <span>View All</span>
              <Kbd className="bg-accent border">⌘K</Kbd>
            </button>
          </div>
        </div>
      )}
      <ul>
        {visibleRecentProjects.map((project) => (
          <li key={project.id}>
            <ProjectItem project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
};
