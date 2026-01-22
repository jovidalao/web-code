import { useEffect, useMemo, useRef } from "react";
import { EditorView } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { File } from "@/types/file";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { minimap } from "../extensions/minimap";
import { indentationMarkers } from "@replit/codemirror-indentation-markers"
import { customSetup } from "../extensions/custom-setup";
import { suggestion } from "../extensions/suggestion";

interface Props {
  fileName: File["name"]
  content: string
  onChange: (content: string) => void
}
export const CodeEditor = ({ fileName, content, onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(() => getLanguageExtension(fileName), [fileName])

  useEffect(() => {
    if (!editorRef.current) return
    const view = new EditorView({
      doc: content,
      parent: editorRef.current,
      extensions: [
        customSetup,
        oneDark,
        suggestion(fileName),
        customTheme,
        languageExtension,
        keymap.of([
          indentWithTab
        ]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        })
      ]
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [languageExtension])

  return (
    <div ref={editorRef}
      className="size-full pl-4 bg-background" />
  )
}