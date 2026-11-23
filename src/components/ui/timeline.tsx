import type { ReactNode } from "react";

export type TimelineItem = { id: string; period: string; title: ReactNode; meta?: ReactNode; body?: ReactNode };

export function Timeline({ items, label }: { items: TimelineItem[]; label: string }) {
  return (
    <ol aria-label={label} className="border-line relative space-y-8 border-l pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            aria-hidden
            className="border-accent bg-paper absolute top-2 -left-[1.95rem] size-3 rounded-full border-2"
          />
          <p className="text-gold text-sm font-semibold">{item.period}</p>
          <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
          {item.meta ? <p className="text-ink-muted text-sm">{item.meta}</p> : null}
          {item.body ? <div className="text-ink-muted mt-2">{item.body}</div> : null}
        </li>
      ))}
    </ol>
  );
}
