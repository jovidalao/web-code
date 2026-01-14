import { ProjectIdView } from "@/components/project-id-view";

async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectIdView projectId={projectId} />;
}

export default ProjectPage;
