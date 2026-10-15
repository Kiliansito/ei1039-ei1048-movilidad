import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place, Route } from "../src/domain/types";
export function MapView({
  places = [],
  route,
  point,
  onPick,
  onPlace,
}: {
  places?: Place[];
  route?: Route;
  point?: { lat: number; lon: number };
  onPick?: (lat: number, lon: number) => void;
  onPlace?: (p: Place) => void;
}) {
  const element = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    layer = useRef<L.LayerGroup | null>(null);
  const pick = useRef(onPick),
    select = useRef(onPlace);
  pick.current = onPick;
  select.current = onPlace;
  const [error, setError] = useState(false);
  useEffect(() => {
    const m = L.map(element.current!, {
      zoomAnimation: false,
      fadeAnimation: false,
    }).setView([39.985, -0.045], 13);
    map.current = m;
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    ).addTo(m);
    tiles.on("tileerror", () => setError(true));
    tiles.on("tileload", () => setError(false));
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e) => pick.current?.(e.latlng.lat, e.latlng.lng));
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(element.current!);
    return () => {
      observer.disconnect();
      m.stop();
      m.remove();
    };
  }, []);
  useEffect(() => {
    const m = map.current,
      group = layer.current;
    if (!m || !group) return;
    group.clearLayers();
    for (const p of places) {
      const label = document.createElement("span");
      label.textContent = p.name;
      L.circleMarker([p.lat, p.lon], {
        radius: 8,
        color: "#245c44",
        fillOpacity: 0.85,
        bubblingMouseEvents: false,
      })
        .bindTooltip(label)
        .on("click", () => select.current?.(p))
        .addTo(group);
    }
    if (
      point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lon) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lon) <= 180
    ) {
      L.circleMarker([point.lat, point.lon], {
        radius: 9,
        color: "#a94a20",
      }).addTo(group);
      m.setView([point.lat, point.lon], m.getZoom(), { animate: false });
    }
    if (route?.geometry.length) {
      const line = L.polyline(
        route.geometry.map((c) => [c[1], c[0]] as L.LatLngTuple),
        { color: "#245c44", weight: 5 },
      ).addTo(group);
      m.fitBounds(line.getBounds(), { padding: [25, 25], animate: false });
    }
  }, [places, route, point]);
  return (
    <div>
      <div ref={element} className="map" aria-label="Mapa de lugares y rutas" />
      {error && (
        <p role="status">
          No se ha podido cargar el mapa. Puedes usar las coordenadas.
        </p>
      )}
    </div>
  );
}
