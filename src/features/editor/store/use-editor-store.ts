import { create } from "zustand";
import { File } from "@/types/file";
import { Project } from "@/types/project";

interface TabState {
  openTabsIds: File["id"][];
  activeTabId: File["id"] | null;
  previewTabId: File["id"] | null;
};

const defaultTabState: TabState = {
  openTabsIds: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Project["id"], TabState>
  getTabState: (projectId: Project["id"]) => TabState
  openFile: (
    projectId: Project["id"],
    fileId: File["id"],
    options: { pinned: boolean }
  ) => void
  closeTab: (
    projectId: Project["id"],
    fileId: File["id"]
  ) => void
  closeAllTabs: (projectId: Project["id"]) => void
  setActiveTab: (projectId: Project["id"], fileId: File["id"]) => void
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: new Map(),
  getTabState: (projectId: Project["id"]) => {
    return get().tabs.get(projectId) ?? defaultTabState;
  },

  openFile: (projectId, fileId, { pinned }) => {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) ?? defaultTabState;
    const { openTabsIds, previewTabId } = tabState;
    const isOpen = openTabsIds.includes(fileId);

    // Case 1: Openning as preview - replace existing preview or add new
    if (!isOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabsIds.map((id) => (id === previewTabId) ? fileId : id)
        : [...openTabsIds, fileId]

      tabs.set(projectId, {
        openTabsIds: newTabs,
        activeTabId: fileId,
        previewTabId: fileId
      })
      set({ tabs });
      return;
    }

    // Case 2: Openning as pinned - add new tab
    if (!isOpen && pinned) {
      tabs.set(projectId, {
        ...tabState,
        openTabsIds: [...openTabsIds, fileId],
        activeTabId: fileId,
      });
      set({ tabs });
      return;
    }

    // Case 3: File already opened - activete it and pin if double-clicked
    const shouldPin = pinned && previewTabId === fileId;
    tabs.set(projectId, {
      ...tabState,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
    set({ tabs });
  },

  closeTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) ?? defaultTabState;
    const { openTabsIds, activeTabId, previewTabId } = tabState;
    const tabIndex = openTabsIds.indexOf(fileId);

    if (tabIndex === -1) return;

    const newTabs = openTabsIds.filter((id) => id !== fileId);

    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabIndex];
      }
    }

    tabs.set(projectId, {
      openTabsIds: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    })
    set({ tabs });
  },

  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },

  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    tabs.set(projectId, { ...state, activeTabId: fileId });
    set({ tabs });
  },
}))