import { useCallback } from "react"

import { useEditorStore } from "@/features/editor/store/use-editor-store";
import { Project } from "@/types/project";
import { File } from "@/types/file";

export const useEditor = (projectId: Project["id"]) => {
  const store = useEditorStore();
  const tabState = useEditorStore((state) => state.getTabState(projectId));

  const openFile = useCallback((
    fileId: File["id"],
    options: { pinned: boolean },
  ) => {
    store.openFile(projectId, fileId, options);
  }, [store, projectId]);

  const closeTab = useCallback(
    (fileId: File["id"]) => {
      store.closeTab(projectId, fileId);
    }, [store, projectId]
  );

  const closeAllTabs = useCallback(() => {
    store.closeAllTabs(projectId);
  }, [store, projectId]);

  const setActiveTab = useCallback((fileId: File["id"]) => {
    store.setActiveTab(projectId, fileId);
  }, [store, projectId]);

  return {
    openTabs: tabState.openTabsIds,
    activeTabId: tabState.activeTabId,
    previewTabId: tabState.previewTabId,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  };
}