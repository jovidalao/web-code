import { TopNavigation } from "./top-navigation";

export const EditorView = ({ projectId }: { projectId: string }) => {

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
    </div>
  );
};