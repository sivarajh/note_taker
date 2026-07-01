import { Book, LogOut, Plus, Trash2 } from "lucide-react";
import { useNotebooksStore } from "../store/useNotebooksStore";
import { useAuth } from "../auth/authContext";

export function Sidebar() {
  const { notebooks, selected, select, addNotebook, deleteNotebook, renameNotebook } =
    useNotebooksStore();
  const resetToSeed = useNotebooksStore((s) => s.resetToSeed);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    resetToSeed();
  };

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <aside className="w-56 bg-onenote-purpleDark text-white flex flex-col">
      <div className="px-4 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold">OneNote Mimic</h1>
        <div className="mt-3 flex items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-6 w-6 shrink-0 rounded-full" />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] uppercase">
              {(user?.email ?? "?").charAt(0)}
            </div>
          )}
          <span className="flex-1 truncate text-xs text-white/70">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="shrink-0 text-white/70 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {notebooks.map((nb) => {
          const active = nb.id === selected.notebookId;
          return (
            <div
              key={nb.id}
              className={`group flex items-center gap-2 px-4 py-2 cursor-pointer text-sm ${
                active ? "bg-white/15" : "hover:bg-white/10"
              }`}
              onClick={() =>
                select({
                  notebookId: nb.id,
                  sectionId: nb.sections[0]?.id,
                  pageId: nb.sections[0]?.pages[0]?.id,
                })
              }
              onDoubleClick={() => {
                const name = prompt("Rename notebook", nb.name);
                if (name) renameNotebook(nb.id, name);
              }}
            >
              <Book size={16} className="shrink-0" />
              <span className="flex-1 truncate">{nb.name}</span>
              <button
                className="opacity-0 group-hover:opacity-100 hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete notebook "${nb.name}"?`)) deleteNotebook(nb.id);
                }}
                aria-label="Delete notebook"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={addNotebook}
        className="flex items-center gap-2 px-4 py-3 text-sm border-t border-white/10 hover:bg-white/10"
      >
        <Plus size={16} /> Notebook
      </button>
    </aside>
  );
}
