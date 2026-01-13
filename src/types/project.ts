// src/types/project.ts
export type Project = {
  id: string;
  name: string;
  owner_id: string;
  updated_at: string;
  import_status?: "importing" | "completed" | "failed";
  export_status?: "exporting" | "completed" | "failed";
  created_at: string;
};
