export type Page = {
  id: string;
  title: string;
  contentHTML: string;
  updatedAt: number;
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
