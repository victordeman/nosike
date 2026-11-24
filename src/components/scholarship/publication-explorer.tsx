"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExplorerItem } from "@/lib/scholarship";
import { cn } from "@/lib/cn";

type ThemeOption = { id: string; label: string };

type SearchDoc = { id: string; title: string; authors: string; venue: string };

const selectClass =
  "border-line bg-paper text-ink min-h-11 w-full rounded-lg border px-3 text-sm font-medium focus:border-accent focus:outline-none";

function readParams(): { type: string; decade: string; theme: string; q: string } {
  if (typeof window === "undefined") return { type: "", decade: "", theme: "", q: "" };
  const p = new URLSearchParams(window.location.search);
  return { type: p.get("type") ?? "", decade: p.get("decade") ?? "", theme: p.get("theme") ?? "", q: p.get("q") ?? "" };
}

export function PublicationExplorer({
  items,
  themes,
}: {
  items: ExplorerItem[];
  themes: ThemeOption[];
}) {
  const [initial] = useState(readParams);
  const [type, setType] = useState(initial.type);
  const [decade, setDecade] = useState(initial.decade);
  const [theme, setTheme] = useState(initial.theme);
  const [q, setQ] = useState(initial.q);
  const [searchHits, setSearchHits] = useState<Set<string> | null>(null);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const fuseRef = useRef<{ search: (pattern: string) => { item: SearchDoc }[] } | null>(null);
  const loadStarted = useRef(false);

  const kindOptions = useMemo(() => {
    const kinds = [...new Set(items.map((i) => i.kind))];
    return kinds.map((k) => ({ value: k, label: items.find((i) => i.kind === k)!.kindLabel }));
  }, [items]);
  const decadeOptions = useMemo(() => [...new Set(items.map((i) => i.decade))].sort().reverse(), [items]);

  // Lazy-load Fuse.js and the build-time search index on first query.
  // Runs once (loadStarted guard): depending on searchState here would let the
  // effect's own cleanup cancel the in-flight load.
  useEffect(() => {
    if (!q || loadStarted.current) return;
    loadStarted.current = true;
    setSearchState("loading");
    (async () => {
      try {
        const [{ default: Fuse }, res] = await Promise.all([
          import("fuse.js"),
          fetch("/search-index.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error("no index")))),
        ]);
        const docs = (res as { items: SearchDoc[] }).items;
        const fuse = new Fuse(docs, { keys: ["title", "authors", "venue"], threshold: 0.25, ignoreLocation: true });
        fuseRef.current = fuse as unknown as typeof fuseRef.current;
        setSearchState("ready");
      } catch {
        setSearchState("error");
      }
    })();
  }, [q]);

  useEffect(() => {
    if (searchState !== "ready" || !q) {
      setSearchHits(null);
      return;
    }
    const fuse = fuseRef.current;
    if (!fuse) return;
    const hits = fuse.search(q);
    setSearchHits(new Set(hits.map((h) => h.item.id)));
  }, [q, searchState]);

  // Keep the URL deep-linkable without a router round-trip.
  useEffect(() => {
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (decade) p.set("decade", decade);
    if (theme) p.set("theme", theme);
    if (q) p.set("q", q);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/scholarship?${qs}` : "/scholarship");
  }, [type, decade, theme, q]);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (type && item.kind !== type) return false;
      if (decade && item.decade !== decade) return false;
      if (theme && !item.themes.includes(theme)) return false;
      if (q) {
        if (searchState === "ready" && searchHits) return searchHits.has(item.id);
        if (searchState === "ready" && !searchHits) return true;
        // While the index loads (or if it failed), fall back to a plain substring match.
        const needle = q.toLowerCase();
        return [item.title, item.authors, item.venue].some((f) => f.toLowerCase().includes(needle));
      }
      return true;
    });
  }, [items, type, decade, theme, q, searchState, searchHits]);

  const activeFilters = [type, decade, theme, q].filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div className="border-line bg-surface grid gap-4 rounded-card border p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="f-type" className="text-ink-muted mb-1 block text-sm font-medium">
            Type
          </label>
          <select id="f-type" className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {kindOptions.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-decade" className="text-ink-muted mb-1 block text-sm font-medium">
            Decade
          </label>
          <select id="f-decade" className={selectClass} value={decade} onChange={(e) => setDecade(e.target.value)}>
            <option value="">All decades</option>
            {decadeOptions.map((d) => (
              <option key={d} value={d}>
                {d === "undated" ? "Undated" : d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-theme" className="text-ink-muted mb-1 block text-sm font-medium">
            Theme
          </label>
          <select id="f-theme" className={selectClass} value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="">All themes</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-q" className="text-ink-muted mb-1 block text-sm font-medium">
            Search
          </label>
          <input
            id="f-q"
            type="search"
            className={selectClass}
            placeholder="Title, author or venue"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <p className="text-ink-muted text-sm" role="status" aria-live="polite">
        Showing {visible.length} of {items.length} publications
        {searchState === "loading" ? " — loading search index…" : ""}
        {activeFilters > 0 ? (
          <>
            {" "}
            <button
              type="button"
              className="text-accent font-semibold underline underline-offset-4"
              onClick={() => {
                setType("");
                setDecade("");
                setTheme("");
                setQ("");
              }}
            >
              Clear filters
            </button>
          </>
        ) : null}
      </p>

      {visible.length === 0 ? (
        <p className="text-ink-muted">No publications match the current filters.</p>
      ) : (
        <ul aria-label="Publications" className="divide-line border-line divide-y rounded-card border bg-surface">
          {visible.map((item) => (
            <li key={item.id} className="p-5 sm:p-6">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-ink-muted mt-1 text-sm">
                {item.authors}
                {item.year !== null ? ` · ${item.year}` : " · n.d."} · {item.kindLabel}
                {item.venue ? ` · ${item.venue}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.themes.map((t) => (
                  <span
                    key={t}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      t === "other" ? "bg-surface-muted text-ink-muted" : "bg-accent/10 text-accent",
                    )}
                  >
                    {themes.find((th) => th.id === t)?.label ?? "Other"}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-start gap-3">
                <p className="text-ink-muted min-w-0 flex-1 text-sm italic">{item.citation}</p>
                <CopyCitation citation={item.citation} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CopyCitation({ citation }: { citation: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = citation;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="border-line text-ink hover:border-accent hover:text-accent min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold"
    >
      {copied ? "Copied" : "Copy citation"}
    </button>
  );
}
