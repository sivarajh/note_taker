import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useNotebooksStore } from "../store/useNotebooksStore";
import type { Notebook } from "../types";

const PUSH_DEBOUNCE_MS = 600;

type NotesRow = { data?: { notebooks?: Notebook[] } } | null;

/**
 * Keeps the notebooks store in sync with the user's `notes` row in Supabase.
 * - On mount / user change: pulls the remote tree into the store (or seeds a new row).
 * - On local changes: debounce-upserts the whole tree back.
 * Selection state is intentionally not synced (it's per-device).
 */
export function useNotesSync(user: User) {
  const [loading, setLoading] = useState(true);
  // Guards so a remote hydrate doesn't immediately echo back as a write, and
  // so we don't push before the initial load has finished.
  const applyingRemote = useRef(false);
  const ready = useRef(false);

  // Load remote whenever the signed-in user changes. The Workspace is remounted
  // on sign-in/out, so this effectively runs once per session; `loading` starts
  // true and is only cleared once the initial pull finishes.
  useEffect(() => {
    let active = true;
    ready.current = false;

    (async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("data")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      const row = data as NotesRow;
      if (error) {
        console.error("Failed to load notes", error);
      } else if (row?.data?.notebooks) {
        applyingRemote.current = true;
        useNotebooksStore.getState().setNotebooks(row.data.notebooks);
        applyingRemote.current = false;
      } else {
        // No row yet — persist the current seed so the user starts with content.
        const notebooks = useNotebooksStore.getState().notebooks;
        const { error: upsertError } = await supabase.from("notes").upsert({
          user_id: user.id,
          data: { notebooks },
          updated_at: new Date().toISOString(),
        });
        if (upsertError) console.error("Failed to seed notes", upsertError);
      }

      ready.current = true;
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user.id]);

  // Push local changes (debounced) back to Supabase.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = useNotebooksStore.subscribe((state, prev) => {
      if (state.notebooks === prev.notebooks) return;
      if (!ready.current || applyingRemote.current) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const notebooks = useNotebooksStore.getState().notebooks;
        const { error } = await supabase.from("notes").upsert({
          user_id: user.id,
          data: { notebooks },
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("Failed to sync notes", error);
      }, PUSH_DEBOUNCE_MS);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [user.id]);

  return { loading };
}
