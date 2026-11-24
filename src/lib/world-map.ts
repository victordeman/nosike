import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import worldAtlas from "world-atlas/countries-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";
import { getCountries } from "./content";
import { COUNTRY_NUMERIC } from "./country-ids";

export type MapCountry = {
  code: string;
  name: string;
  verified: boolean;
  roles: string[];
  path: string;
};

export type WorldMapData = {
  viewBox: string;
  worldPath: string;
  countries: MapCountry[];
};

/**
 * Server-side SVG geometry for the global footprint map: full world outline muted,
 * Prof. Nosike's countries highlighted. No mapping tiles, no client JS.
 */
export function getWorldMapData(): WorldMapData {
  const topology = worldAtlas as unknown as Topology<{ countries: GeometryCollection<never> }>;
  const collection = feature(topology, topology.objects.countries) as unknown as FeatureCollection;
  const projection = geoNaturalEarth1().fitExtent(
    [
      [24, 24],
      [976, 476],
    ],
    collection,
  );
  const path = geoPath(projection);

  const worldPath = path({ type: "FeatureCollection", features: collection.features }) ?? "";

  const byNumericId = new Map(collection.features.map((f) => [String(f.id), f]));
  const countries: MapCountry[] = getCountries()
    .map((c): MapCountry | null => {
      const numeric = COUNTRY_NUMERIC[c.code];
      const f = numeric ? byNumericId.get(numeric) : undefined;
      if (!f) return null;
      const d = path(f);
      if (!d) return null;
      return {
        code: c.code,
        name: c.name,
        verified: c.verified !== false,
        roles: c.roles,
        path: d,
      };
    })
    .filter((c): c is MapCountry => c !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  return { viewBox: "0 0 1000 500", worldPath, countries };
}

export const ROLE_LABELS: Record<string, string> = {
  "academic-appointment": "Academic appointment",
  study: "Study",
  events: "Events",
  consultancy: "Consultancy",
};
