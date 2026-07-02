import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Notebook, Section, Page } from "../types";

const SECTION_COLORS = [
  "#7719AA", "#E11D48", "#0891B2", "#16A34A",
  "#D97706", "#2563EB", "#DB2777", "#65A30D",
];

function newPage(title = "Untitled page"): Page {
  return { id: nanoid(8), title, contentHTML: "", updatedAt: Date.now() };
}
function newSection(name = "New Section", colorIdx = 0): Section {
  return {
    id: nanoid(8),
    name,
    color: SECTION_COLORS[colorIdx % SECTION_COLORS.length],
    pages: [newPage("Welcome")],
  };
}
function newNotebook(name = "My Notebook"): Notebook {
  return { id: nanoid(8), name, sections: [newSection("Quick Notes", 0)] };
}

// Fresh starting content for a brand-new (or signed-out) user.
function seedNotebooks(): Notebook[] {
  return [
    {
      id: nanoid(8),
      name: "Personal",
      sections: [
        {
          id: nanoid(8),
          name: "Ideas",
          color: SECTION_COLORS[0],
          pages: [
            {
              id: nanoid(8),
              title: "Welcome to Notes of Hari",
              contentHTML:
                "<h1>Welcome 👋</h1><p>This is a OneNote-style note-taking app. Use the left sidebar to organize <strong>Notebooks</strong>, <em>Sections</em>, and Pages.</p><ul><li>Click <strong>+ Notebook</strong> to add a new notebook</li><li>Use the toolbar to format text</li><li>Everything syncs to your account</li></ul>",
              updatedAt: Date.now(),
            },
          ],
        },
      ],
    },
  ];
}

type Selected = { notebookId?: string; sectionId?: string; pageId?: string };

type State = {
  notebooks: Notebook[];
  selected: Selected;
};

type Actions = {
  select: (s: Selected) => void;
  setNotebooks: (notebooks: Notebook[]) => void;
  resetToSeed: () => void;
  addNotebook: () => void;
  renameNotebook: (id: string, name: string) => void;
  deleteNotebook: (id: string) => void;
  addSection: (notebookId: string) => void;
  renameSection: (notebookId: string, id: string, name: string) => void;
  deleteSection: (notebookId: string, id: string) => void;
  addPage: (notebookId: string, sectionId: string) => void;
  renamePage: (notebookId: string, sectionId: string, id: string, title: string) => void;
  deletePage: (notebookId: string, sectionId: string, id: string) => void;
  updatePageContent: (notebookId: string, sectionId: string, id: string, html: string) => void;
};

export const useNotebooksStore = create<State & Actions>()((set) => ({
  notebooks: seedNotebooks(),
  selected: {},

  select: (s) => set({ selected: s }),

  setNotebooks: (notebooks) => set({ notebooks }),

  resetToSeed: () => set({ notebooks: seedNotebooks(), selected: {} }),

      addNotebook: () =>
        set((st) => {
          const nb = newNotebook(`Notebook ${st.notebooks.length + 1}`);
          return {
            notebooks: [...st.notebooks, nb],
            selected: {
              notebookId: nb.id,
              sectionId: nb.sections[0].id,
              pageId: nb.sections[0].pages[0].id,
            },
          };
        }),

      renameNotebook: (id, name) =>
        set((st) => ({
          notebooks: st.notebooks.map((n) => (n.id === id ? { ...n, name } : n)),
        })),

      deleteNotebook: (id) =>
        set((st) => {
          const notebooks = st.notebooks.filter((n) => n.id !== id);
          const sel = st.selected.notebookId === id ? {} : st.selected;
          return { notebooks, selected: sel };
        }),

      addSection: (notebookId) =>
        set((st) => {
          let createdSection: Section | undefined;
          const notebooks = st.notebooks.map((n) => {
            if (n.id !== notebookId) return n;
            const sec = newSection(`Section ${n.sections.length + 1}`, n.sections.length);
            createdSection = sec;
            return { ...n, sections: [...n.sections, sec] };
          });
          return {
            notebooks,
            selected: createdSection
              ? {
                  notebookId,
                  sectionId: createdSection.id,
                  pageId: createdSection.pages[0].id,
                }
              : st.selected,
          };
        }),

      renameSection: (notebookId, id, name) =>
        set((st) => ({
          notebooks: st.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : {
                  ...n,
                  sections: n.sections.map((s) =>
                    s.id === id ? { ...s, name } : s
                  ),
                }
          ),
        })),

      deleteSection: (notebookId, id) =>
        set((st) => ({
          notebooks: st.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : { ...n, sections: n.sections.filter((s) => s.id !== id) }
          ),
          selected:
            st.selected.sectionId === id
              ? { notebookId: st.selected.notebookId }
              : st.selected,
        })),

      addPage: (notebookId, sectionId) =>
        set((st) => {
          let createdPage: Page | undefined;
          const notebooks = st.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : {
                  ...n,
                  sections: n.sections.map((s) => {
                    if (s.id !== sectionId) return s;
                    const p = newPage("Untitled page");
                    createdPage = p;
                    return { ...s, pages: [...s.pages, p] };
                  }),
                }
          );
          return {
            notebooks,
            selected: createdPage
              ? { notebookId, sectionId, pageId: createdPage.id }
              : st.selected,
          };
        }),

      renamePage: (notebookId, sectionId, id, title) =>
        set((st) => ({
          notebooks: st.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : {
                  ...n,
                  sections: n.sections.map((s) =>
                    s.id !== sectionId
                      ? s
                      : {
                          ...s,
                          pages: s.pages.map((p) =>
                            p.id === id ? { ...p, title, updatedAt: Date.now() } : p
                          ),
                        }
                  ),
                }
          ),
        })),

      deletePage: (notebookId, sectionId, id) =>
        set((st) => ({
          notebooks: st.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : {
                  ...n,
                  sections: n.sections.map((s) =>
                    s.id !== sectionId
                      ? s
                      : { ...s, pages: s.pages.filter((p) => p.id !== id) }
                  ),
                }
          ),
          selected:
            st.selected.pageId === id
              ? { notebookId: st.selected.notebookId, sectionId: st.selected.sectionId }
              : st.selected,
        })),

      updatePageContent: (notebookId, sectionId, id, html) =>
        set((st) => ({
          notebooks: st.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : {
                  ...n,
                  sections: n.sections.map((s) =>
                    s.id !== sectionId
                      ? s
                      : {
                          ...s,
                          pages: s.pages.map((p) =>
                            p.id === id
                              ? { ...p, contentHTML: html, updatedAt: Date.now() }
                              : p
                          ),
                        }
                  ),
                }
          ),
        })),
}));

export function findSelection(
  notebooks: Notebook[],
  sel: Selected
): { notebook?: Notebook; section?: Section; page?: Page } {
  const notebook = notebooks.find((n) => n.id === sel.notebookId);
  const section = notebook?.sections.find((s) => s.id === sel.sectionId);
  const page = section?.pages.find((p) => p.id === sel.pageId);
  return { notebook, section, page };
}
