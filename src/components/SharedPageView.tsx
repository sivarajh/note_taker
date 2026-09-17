import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { fetchSharedPage, type SharedPage } from "../lib/shares";

type ViewState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; page: SharedPage };

/** Public, read-only view of a shared page. Rendered without any auth. */
export function SharedPageView({ shareId }: { shareId: string }) {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetchSharedPage(shareId)
      .then((page) => {
        if (!active) return;
        setState(page ? { status: "ready", page } : { status: "missing" });
      })
      .catch((e) => {
        console.error("Failed to load shared page", e);
        if (active) setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [shareId]);

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 bg-onenote-purple px-6 py-3 text-white">
        <span className="text-lg font-semibold">Notty</span>
        <span className="text-xs opacity-80">Shared page · read-only</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {state.status === "loading" && (
          <p className="p-8 text-sm text-gray-500">Loading shared page…</p>
        )}
        {state.status === "missing" && (
          <p className="p-8 text-sm text-gray-500">
            This shared page doesn't exist or is no longer shared.
          </p>
        )}
        {state.status === "error" && (
          <p className="p-8 text-sm text-red-600">
            Couldn't load this shared page. Try again later.
          </p>
        )}
        {state.status === "ready" && (
          <article className="mx-auto max-w-3xl shared-view">
            <h1 className="px-8 pt-8 pb-2 text-3xl font-semibold text-gray-900">
              {state.page.title || "Untitled page"}
            </h1>
            <div className="px-8 py-2 text-xs text-gray-400">
              Last updated {new Date(state.page.updated_at).toLocaleString()}
            </div>
            <div
              className="ProseMirror"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(state.page.content_html),
              }}
            />
          </article>
        )}
      </div>
    </div>
  );
}
