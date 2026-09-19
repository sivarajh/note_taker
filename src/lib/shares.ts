import { nanoid } from "nanoid";
import { supabase } from "./supabase";
import type { Notebook, Page } from "../types";

export type SharedPage = {
  title: string;
  content_html: string;
  updated_at: string;
};

/** Matches the public share route, e.g. "#/s/V1StGXR8_Z5jdHi6B-myT". */
export function getShareIdFromHash(): string | null {
  const m = window.location.hash.match(/^#\/s\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

export function buildShareUrl(shareId: string): string {
  return `${window.location.origin}${window.location.pathname}#/s/${shareId}`;
}

export async function createShare(userId: string, page: Page): Promise<string> {
  const id = nanoid(21);
  const { error } = await supabase.from("shared_pages").upsert({
    id,
    user_id: userId,
    page_id: page.id,
    title: page.title,
    content_html: page.contentHTML,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return id;
}

export async function deleteShare(shareId: string): Promise<void> {
  const { error } = await supabase.from("shared_pages").delete().eq("id", shareId);
  if (error) throw error;
}

/**
 * Pushes the current title/content of every shared page so public links stay
 * live, and revokes rows whose page no longer carries a shareId (unshared on
 * another device, or the page was deleted).
 */
export async function syncShares(userId: string, notebooks: Notebook[]): Promise<void> {
  const now = new Date().toISOString();
  const rows = notebooks.flatMap((n) =>
    n.sections.flatMap((s) =>
      s.pages
        .filter((p) => p.shareId)
        .map((p) => ({
          id: p.shareId!,
          user_id: userId,
          page_id: p.id,
          title: p.title,
          content_html: p.contentHTML,
          updated_at: now,
        }))
    )
  );

  if (rows.length) {
    const { error } = await supabase.from("shared_pages").upsert(rows);
    if (error) console.error("Failed to sync shared pages", error);
  }

  let stale = supabase.from("shared_pages").delete().eq("user_id", userId);
  if (rows.length) {
    stale = stale.not(
      "id",
      "in",
      `(${rows.map((r) => `"${r.id}"`).join(",")})`
    );
  }
  const { error: staleError } = await stale;
  if (staleError) console.error("Failed to revoke stale shares", staleError);
}

/** Anonymous fetch via the get_shared_page RPC (see SUPABASE_SETUP.md). */
export async function fetchSharedPage(shareId: string): Promise<SharedPage | null> {
  const { data, error } = await supabase.rpc("get_shared_page", { share_id: shareId });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as SharedPage | undefined;
  return row ?? null;
}
