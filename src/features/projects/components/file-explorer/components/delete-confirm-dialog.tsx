"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { File } from "@/types/file";

interface DeleteConfirmDialogProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({
  file,
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  if (!file) return null;

  const isFolder = file.type === "folder";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {isFolder ? "folder" : "file"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isFolder
              ? `Are you sure you want to delete "${file.name}" and all its contents? This action cannot be undone.`
              : `Are you sure you want to delete "${file.name}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
