import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { useNotebooksStore, findSelection } from "../store/useNotebooksStore";
import { EditorToolbar } from "./EditorToolbar";

export function Editor() {
  const { notebooks, selected, updatePageContent, renamePage } = useNotebooksStore();
  const { notebook, section, page } = findSelection(notebooks, selected);

  const saveTimer = useRef<number | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem.configure({ nested: true })],
    content: page?.contentHTML || "",
    editorProps: {
      attributes: { class: "ProseMirror" },
    },
    onUpdate: ({ editor }) => {
      if (!notebook || !section || !page) return;
      if (editor.isDestroyed) return;
      const html = editor.getHTML();
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        updatePageContent(notebook.id, section.id, page.id, html);
      }, 300);
    },
  });

  useEffect(() => {
    if (editor && page) {
      const current = editor.getHTML();
      if (current !== page.contentHTML) {
        editor.commands.setContent(page.contentHTML || "", { emitUpdate: false });
      }
    }
  }, [editor, page?.id]);

  if (!page || !notebook || !section) {
    return (
      <main className="flex-1 flex items-center justify-center text-gray-400 bg-white">
        Select or create a page to start writing
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <input
          value={page.title}
          onChange={(e) => renamePage(notebook.id, section.id, page.id, e.target.value)}
          placeholder="Untitled page"
          className="w-full px-8 pt-8 pb-2 text-3xl font-semibold text-gray-900 outline-none border-b border-gray-100"
        />
        <div className="text-xs text-gray-400 px-8 py-2">
          {new Date(page.updatedAt).toLocaleString()}
        </div>
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
