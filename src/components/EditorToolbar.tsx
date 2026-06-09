import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo2, Redo2,
} from "lucide-react";

function Btn({
  active, onClick, children, title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-gray-200 ${
        active ? "bg-onenote-purpleLight text-onenote-purple" : "text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const c = () => editor.chain().focus();
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
      <Btn title="Undo" onClick={() => c().undo().run()}><Undo2 size={16} /></Btn>
      <Btn title="Redo" onClick={() => c().redo().run()}><Redo2 size={16} /></Btn>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })}
        onClick={() => c().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></Btn>
      <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })}
        onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
      <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })}
        onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <Btn title="Bold" active={editor.isActive("bold")}
        onClick={() => c().toggleBold().run()}><Bold size={16} /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")}
        onClick={() => c().toggleItalic().run()}><Italic size={16} /></Btn>
      <Btn title="Strike" active={editor.isActive("strike")}
        onClick={() => c().toggleStrike().run()}><Strikethrough size={16} /></Btn>
      <Btn title="Code" active={editor.isActive("code")}
        onClick={() => c().toggleCode().run()}><Code size={16} /></Btn>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <Btn title="Bullet list" active={editor.isActive("bulletList")}
        onClick={() => c().toggleBulletList().run()}><List size={16} /></Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")}
        onClick={() => c().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")}
        onClick={() => c().toggleBlockquote().run()}><Quote size={16} /></Btn>
    </div>
  );
}
