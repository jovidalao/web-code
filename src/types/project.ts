// src/types/project.ts
export type Project = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  import_status?: "importing" | "completed" | "failed" | "cancelled";
  export_status?: "exporting" | "completed" | "failed" | "cancelled";
  export_repo_url?: string;
};
