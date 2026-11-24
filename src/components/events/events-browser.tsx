"use client";

import { useMemo, useState } from "react";
import type { Conference } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type EventItem = Conference & { year: number };

const FILTERS = [
  { key: "all", label: "All roles" },
  { key: "chair", label: "Chair" },
  { key: "scientific", label: "Scientific committee" },
  { key: "director", label: "Conference director" },
];

export function roleBadge(role: string): { label: string; tone: "accent" | "gold" | "neutral" } {
  if (/scientific committee/i.test(role)) return { label: "Scientific committee", tone: "gold" };
  if (/\bchair/i.test(role)) return { label: "Chair", tone: "accent" };
  return { label: "Conference director", tone: "neutral" };
}

function badgeKey(role: string): (typeof FILTERS)[number]["key"] {
  if (/scientific committee/i.test(role)) return "scientific";
  if (/\bchair/i.test(role)) return "chair";
  return "director";
}

export function EventsBrowser({ events }: { events: EventItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const visible = useMemo(
    () => (filter === "all" ? events : events.filter((e) => badgeKey(e.role) === filter)),
    [events, filter],
  );

  return (
    <div className="space-y-8">
      <div role="group" aria-label="Filter events by role" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
              filter === f.key
                ? "border-accent bg-accent text-accent-contrast"
                : "border-line text-ink-muted hover:border-accent hover:text-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-ink-muted">No events in this category.</p>
      ) : (
        <ol aria-label="Events timeline" className="border-line relative space-y-8 border-l pl-6">
          {visible.map((event) => {
            const badge = roleBadge(event.role);
            return (
              <li key={event.id} className="relative">
                <span
                  aria-hidden
                  className="border-accent bg-paper absolute top-2 -left-[1.95rem] size-3 rounded-full border-2"
                />
                <p className="text-gold text-sm font-semibold">
                  {event.dates} · {event.venue}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{event.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  {event.status === "pending" ? <Badge tone="neutral">Pending confirmation</Badge> : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
