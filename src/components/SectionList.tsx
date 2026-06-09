import { Plus, Trash2 } from "lucide-react";
import { useNotebooksStore, findSelection } from "../store/useNotebooksStore";

export function SectionList() {
  const { notebooks, selected, select, addSection, deleteSection, renameSection } =
    useNotebooksStore();
  const { notebook } = findSelection(notebooks, selected);

  if (!notebook) {
    return (
      <div className="w-56 bg-gray-100 border-r border-gray-200 p-4 text-sm text-gray-500">
        Select a notebook
      </div>
    );
  }

  return (
    <aside className="w-56 bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {notebook.name}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {notebook.sections.map((s) => {
          const active = s.id === selected.sectionId;
          return (
            <div
              key={s.id}
              className={`group flex items-center gap-2 px-4 py-2 cursor-pointer text-sm ${
                active ? "bg-white shadow-sm" : "hover:bg-white/60"
              }`}
              onClick={() =>
                select({
                  notebookId: notebook.id,
                  sectionId: s.id,
                  pageId: s.pages[0]?.id,
                })
              }
              onDoubleClick={() => {
                const name = prompt("Rename section", s.name);
                if (name) renameSection(notebook.id, s.id, name);
              }}
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: s.color }}
              />
              <span className="flex-1 truncate text-gray-800">{s.name}</span>
              <button
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete section "${s.name}"?`))
                    deleteSection(notebook.id, s.id);
                }}
                aria-label="Delete section"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => addSection(notebook.id)}
        className="flex items-center gap-2 px-4 py-3 text-sm border-t border-gray-200 hover:bg-white/60 text-gray-700"
      >
        <Plus size={16} /> Section
      </button>
    </aside>
  );
}
