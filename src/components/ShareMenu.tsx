import { useState } from "react";
import { Check, Copy, Link2Off, Share2 } from "lucide-react";
import type { Page } from "../types";
import { useAuth } from "../auth/authContext";
import { useNotebooksStore } from "../store/useNotebooksStore";
import { buildShareUrl, createShare, deleteShare } from "../lib/shares";

export function ShareMenu({
  notebookId,
  sectionId,
  page,
}: {
  notebookId: string;
  sectionId: string;
  page: Page;
}) {
  const { user } = useAuth();
  const setPageShareId = useNotebooksStore((s) => s.setPageShareId);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  const shareUrl = page.shareId ? buildShareUrl(page.shareId) : null;

  const share = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = await createShare(user.id, page);
      setPageShareId(notebookId, sectionId, page.id, id);
    } catch (e) {
      console.error("Failed to create share", e);
      setError("Couldn't create the link. Is the shared_pages table set up?");
    } finally {
      setBusy(false);
    }
  };

  const unshare = async () => {
    if (!page.shareId) return;
    setBusy(true);
    setError(null);
    try {
      await deleteShare(page.shareId);
      setPageShareId(notebookId, sectionId, page.id, undefined);
    } catch (e) {
      console.error("Failed to stop sharing", e);
      setError("Couldn't stop sharing. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copy failed — select the link and copy it manually.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={page.shareId ? "Shared — anyone with the link can view" : "Share this page"}
        className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-gray-200 ${
          page.shareId ? "text-onenote-purple" : "text-gray-600"
        }`}
      >
        <Share2 size={15} />
        {page.shareId ? "Shared" : "Share"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-80 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          {shareUrl ? (
            <>
              <div className="mb-2 text-xs text-gray-500">
                Anyone with this link can view this page (read-only, no sign-in).
                The link always shows the latest saved version.
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700"
                />
                <button
                  onClick={copy}
                  title="Copy link"
                  className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                >
                  {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                </button>
              </div>
              <button
                onClick={unshare}
                disabled={busy}
                className="mt-2 flex items-center gap-1.5 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Link2Off size={13} /> Stop sharing
              </button>
            </>
          ) : (
            <>
              <div className="mb-2 text-xs text-gray-500">
                Create a public link so anyone can view this page without signing in.
              </div>
              <button
                onClick={share}
                disabled={busy}
                className="rounded bg-onenote-purple px-3 py-1.5 text-sm text-white hover:bg-onenote-purpleDark disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create public link"}
              </button>
            </>
          )}
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        </div>
      )}
    </div>
  );
}
