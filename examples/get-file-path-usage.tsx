// 示例：如何使用 getFilePath 方法

import { useFiles } from "@/features/projects/hooks/use-files";

// 在组件中使用
const MyComponent = ({ projectId, fileId }: { projectId: string; fileId: string }) => {
  const { getFilePath } = useFiles(projectId);

  // 获取文件路径
  const filePath = getFilePath(fileId);

  // 示例输出：
  // [
  //   { id: "1", name: "src", type: "folder", ... },
  //   { id: "2", name: "components", type: "folder", ... },
  //   { id: "3", name: "button.tsx", type: "file", ... }
  // ]

  return (
    <div className="flex items-center gap-2 text-sm">
      {filePath.map((file, index) => (
        <div key={file.id} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">›</span>}
          <span className={file.type === "file" ? "font-semibold" : ""}>
            {file.name}
          </span>
        </div>
      ))}
    </div>
  );
};

// 输出效果：src › components › button.tsx
