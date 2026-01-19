import { Fragment } from "react"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"

import { useEditor } from "../hooks/use-editor"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Project } from "@/types/project"
import { useFiles } from "@/features/projects/hooks/use-files"
import { File } from "@/types/file"

export const FileBreadcrumbs = ({
  projectId,
  fileId
}: {
  projectId: Project["id"]
  fileId: File["id"]
}) => {
  const { getFilePath } = useFiles(projectId)
  const path = getFilePath(fileId)

  if (path.length === 0) return null

  return (
    <Breadcrumb className="px-4 py-1.5 border-b bg-background">
      <BreadcrumbList>
        {path.map((file, index) => {
          const isLast = index === path.length - 1

          return (
            <Fragment key={file.id}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    <FileIcon fileName={file.name} className="size-4" />
                    <span>{file.name}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="flex items-center gap-1.5 cursor-pointer">
                    <FolderIcon folderName={file.name} className="size-4" />
                    <span>{file.name}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}