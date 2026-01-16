// src/types/file.ts
export type FileType = "file" | "folder";

export type File = {
  id: string;
  project_id: string;
  parent_id?: string;
  name: string;
  type: FileType;
  content?: string; // Text files only
  storage_id?: string; // Binary files only (reference to Supabase Storage)
  updated_at: number; // Unix timestamp
  created_at: string;
};

// Helper type for creating a new file
export type CreateFileInput = {
  project_id: string;
  parent_id?: string;
  name: string;
  type: FileType;
  content?: string;
  storage_id?: string;
};

// Helper type for updating a file
export type UpdateFileInput = {
  name?: string;
  content?: string;
  parent_id?: string;
};
