"use client";

import { useMemo, useState } from "react";
import type { CareerRole } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const FILTERS = [
  { key: "all", label: "All roles" },
  { key: "academic", label: "Academic" },
  { key: "visiting", label: "Visiting & concurrent" },
  { key: "pre-academic", label: "Media, publishing & enterprise" },
] as const;

function period(role: CareerRole): string {
  const end = role.dates.end === "present" ? "present" : role.dates.end;
  return `${role.dates.start}–${end}`;
}

export function CareerBrowser({ roles }: { roles: CareerRole[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const visible = useMemo(
    () => (filter === "all" ? roles : roles.filter((r) => r.kind === filter)),
    [roles, filter],
  );

  return (
    <div className="space-y-8">
      <div role="group" aria-label="Filter career timeline" className="flex flex-wrap gap-2">
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
        <p className="text-ink-muted">No roles in this category.</p>
      ) : (
        <ol aria-label="Career timeline" className="border-line relative space-y-8 border-l pl-6">
          {visible.map((role) => (
            <li key={role.id} className="relative">
              <span
                aria-hidden
                className="border-accent bg-paper absolute top-2 -left-[1.95rem] size-3 rounded-full border-2"
              />
              <p className="text-gold text-sm font-semibold">
                {period(role)}
                {role.verified === false ? (
                  <>
                    {" "}
                    <Badge tone="gold">Pending confirmation</Badge>
                  </>
                ) : null}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{role.title}</h3>
              <p className="text-ink-muted text-sm">
                {role.institution} · {role.place}, {role.country}
              </p>
              {role.subRoles && role.subRoles.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Roles and responsibilities">
                  {role.subRoles.map((sub) => (
                    <li key={sub}>
                      <Badge tone="neutral">{sub}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
