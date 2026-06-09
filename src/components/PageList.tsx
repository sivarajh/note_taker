import { Plus, Trash2, FileText } from "lucide-react";
import { useNotebooksStore, findSelection } from "../store/useNotebooksStore";

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PageList() {
  const { notebooks, selected, select, addPage, deletePage } = useNotebooksStore();
  const { notebook, section } = findSelection(notebooks, selected);

  if (!section) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4 text-sm text-gray-500">
        Select a section
      </div>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div
        className="px-4 py-3 border-b border-gray-200"
        style={{ borderTop: `3px solid ${section.color}` }}
      >
        <h2 className="text-sm font-semibold text-gray-800">{section.name}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {section.pages.map((p) => {
          const active = p.id === selected.pageId;
          return (
            <div
              key={p.id}
              className={`group flex items-start gap-2 px-4 py-3 cursor-pointer border-b border-gray-100 ${
                active ? "bg-onenote-purpleLight" : "hover:bg-gray-50"
              }`}
              onClick={() =>
                select({
                  notebookId: notebook!.id,
                  sectionId: section.id,
                  pageId: p.id,
                })
              }
            >
              <FileText size={14} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {p.title || "Untitled page"}
                </div>
                <div className="text-xs text-gray-500">{formatDate(p.updatedAt)}</div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this page?")) deletePage(notebook!.id, section.id, p.id);
                }}
                aria-label="Delete page"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => addPage(notebook!.id, section.id)}
        className="flex items-center gap-2 px-4 py-3 text-sm border-t border-gray-200 hover:bg-gray-50 text-gray-700"
      >
        <Plus size={16} /> Page
      </button>
    </aside>
  );
}
