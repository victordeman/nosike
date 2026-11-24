/** Key fact. The final value is always rendered in HTML (no-JS and reduced-motion safe). */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-gold-soft flex flex-col-reverse border-l-2 pl-4">
      <dt className="text-ink-muted text-sm">{label}</dt>
      <dd className="text-ink font-serif text-4xl font-semibold">{value}</dd>
    </div>
  );
}

export function StatList({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">{children}</dl>;
}
