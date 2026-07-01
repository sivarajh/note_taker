import type { User } from "@supabase/supabase-js";
import { Sidebar } from "./components/Sidebar";
import { SectionList } from "./components/SectionList";
import { PageList } from "./components/PageList";
import { Editor } from "./components/Editor";
import { Login } from "./components/Login";
import { useAuth } from "./auth/authContext";
import { useNotesSync } from "./hooks/useNotesSync";

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-500">
      {label}
    </div>
  );
}

function Workspace({ user }: { user: User }) {
  const { loading } = useNotesSync(user);

  if (loading) return <Spinner label="Loading your notes…" />;

  return (
    <div className="flex h-full w-full bg-gray-50">
      <Sidebar />
      <SectionList />
      <PageList />
      <Editor />
    </div>
  );
}

export default function App() {
  const { loading, user } = useAuth();

  if (loading) return <Spinner label="Loading…" />;
  if (!user) return <Login />;
  return <Workspace user={user} />;
}
