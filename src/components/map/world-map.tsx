import { getWorldMapData, ROLE_LABELS } from "@/lib/world-map";

/**
 * Global footprint map (SPEC §4.2): decorative SVG with an accessible list alternative.
 * Verified countries are solid accent; unverified (pending client confirmation) are muted with a dashed outline.
 */
export function WorldMap({ headingLevel = "h2", withList = true }: { headingLevel?: "h2" | "h3"; withList?: boolean }) {
  const data = getWorldMapData();
  const verified = data.countries.filter((c) => c.verified);
  const unverified = data.countries.filter((c) => !c.verified);
  const HeadingTag = headingLevel;

  return (
    <div className="space-y-6">
      <figure>
        <svg
          viewBox={data.viewBox}
          role="img"
          aria-labelledby="world-map-title world-map-desc"
          className="h-auto w-full"
        >
          <title id="world-map-title">Map of countries where Prof. Nosike has academic, study or consultancy engagements</title>
          <desc id="world-map-desc">
            World map highlighting {verified.length} confirmed countries and {unverified.length} countries pending
            confirmation.{withList ? " The full list is available below as text." : ""}
          </desc>
          <path d={data.worldPath} className="fill-surface-muted stroke-line" strokeWidth={0.5} />
          {data.countries.map((c) => (
            <path
              key={c.code}
              d={c.path}
              className={
                c.verified
                  ? "fill-accent/80 stroke-accent"
                  : "fill-surface-muted stroke-ink-muted"
              }
              strokeWidth={c.verified ? 0.6 : 0.8}
              strokeDasharray={c.verified ? undefined : "2 1.5"}
            />
          ))}
        </svg>
        <figcaption className="text-ink-muted mt-3 text-sm">
          Solid countries are confirmed; dashed outlines are pending client confirmation.
          {withList ? " The list below is the accessible equivalent." : ""}
        </figcaption>
      </figure>

      {withList ? (
      <details className="border-line rounded-card border bg-surface p-5">
        <summary className="cursor-pointer font-semibold">
          <HeadingTag className="inline font-semibold">Countries ({data.countries.length})</HeadingTag>
        </summary>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.countries.map((c) => (
            <li key={c.code} className="text-sm">
              <span className="font-semibold">{c.name}</span>
              {c.roles.length > 0 ? (
                <span className="text-ink-muted">
                  {" "}
                  — {c.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}
                </span>
              ) : null}
              {c.verified ? null : <span className="text-ink-muted"> (pending confirmation)</span>}
            </li>
          ))}
        </ul>
      </details>
      ) : null}
    </div>
  );
}
