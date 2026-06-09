import { Sidebar } from "./components/Sidebar";
import { SectionList } from "./components/SectionList";
import { PageList } from "./components/PageList";
import { Editor } from "./components/Editor";

export default function App() {
  return (
    <div className="flex h-full w-full bg-gray-50">
      <Sidebar />
      <SectionList />
      <PageList />
      <Editor />
    </div>
  );
}
