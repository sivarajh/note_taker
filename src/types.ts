export type Page = {
  id: string;
  title: string;
  contentHTML: string;
  updatedAt: number;
  /** Set when the page has a public share link (id of its shared_pages row). */
  shareId?: string;
};

export type Section = {
  id: string;
  name: string;
  color: string;
  pages: Page[];
};

export type Notebook = {
  id: string;
  name: string;
  sections: Section[];
};
