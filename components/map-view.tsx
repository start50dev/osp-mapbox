"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DrawingTools, DrawingTool } from "./drawing-tools";
import { MapControls } from "./map-controls";
import { useDrawing } from "@/hooks/use-drawing";
import { toast } from "sonner";

mapboxgl.accessToken = "pk.eyJ1Ijoid2VlcGx1c2RldiIsImEiOiJjbTN0OTV5eDQwNWNlMmpwYzQxODF6MGwzIn0.sj-ffms1rcoW2159q3q5kQ";

const DEFAULT_CENTER = [100.5018, 13.7563];
const DEFAULT_ZOOM = 12;

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const { startDrawing, continueDrawing, finishDrawing } = useDrawing(map);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: true,
    });

    const nav = new mapboxgl.NavigationControl({ visualizePitch: true });
    map.current.addControl(nav, "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.ScaleControl());

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource("drawing", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.current.addSource("imported", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.current.addLayer({
        id: "drawing-line",
        type: "line",
        source: "drawing",
        paint: {
          "line-color": [
            "match",
            ["get", "type"],
            "straightLine", "#FF0000",
            "line", "#0000FF",
            "#FF0000"
          ],
          "line-width": 2,
        },
        filter: ["==", "$type", "LineString"],
      });

      map.current.addLayer({
        id: "drawing-point",
        type: "circle",
        source: "drawing",
        paint: {
          "circle-radius": 5,
          "circle-color": "#FF0000",
        },
        filter: ["==", "$type", "Point"],
      });

      map.current.addLayer({
        id: "imported-points",
        type: "circle",
        source: "imported",
        paint: {
          "circle-radius": 6,
          "circle-color": "#4CAF50",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
        filter: ["==", "$type", "Point"],
      });

      map.current.addLayer({
        id: "imported-lines",
        type: "line",
        source: "imported",
        paint: {
          "line-color": "#4CAF50",
          "line-width": 2,
        },
        filter: ["==", "$type", "LineString"],
      });

      map.current.addLayer({
        id: "imported-polygons",
        type: "fill",
        source: "imported",
        paint: {
          "fill-color": "#4CAF50",
          "fill-opacity": 0.4,
        },
        filter: ["==", "$type", "Polygon"],
      });

      // Add popup on imported features
      map.current.on('click', ['imported-points', 'imported-lines', 'imported-polygons'], (e) => {
        if (!e.features?.length) return;

        const feature = e.features[0];
        const coordinates = e.lngLat;
        const properties = Object.entries(feature.properties || {})
          .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
          .join('<br>');

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(properties)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', ['imported-points', 'imported-lines', 'imported-polygons'], () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', ['imported-points', 'imported-lines', 'imported-polygons'], () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (activeTool === "point") {
        startDrawing([e.lngLat.lng, e.lngLat.lat], "point");
      } else if (activeTool === "line") {
        continueDrawing([e.lngLat.lng, e.lngLat.lat], "line");
      } else if (activeTool === "straightLine") {
        startDrawing([e.lngLat.lng, e.lngLat.lat], "straightLine");
      }
    };

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (activeTool === "straightLine") {
        continueDrawing([e.lngLat.lng, e.lngLat.lat], "straightLine");
      }
    };

    const handleDblClick = () => {
      if (activeTool === "line") {
        finishDrawing("line");
      } else if (activeTool === "straightLine") {
        finishDrawing("straightLine");
      }
    };

    map.current.on("click", handleClick);
    map.current.on("mousemove", handleMouseMove);
    map.current.on("dblclick", handleDblClick);

    return () => {
      if (map.current) {
        map.current.off("click", handleClick);
        map.current.off("mousemove", handleMouseMove);
        map.current.off("dblclick", handleDblClick);
      }
    };
  }, [activeTool, startDrawing, continueDrawing, finishDrawing]);

  const handleFileImport = (geojson: any) => {
    if (!map.current) return;

    try {
      const source = map.current.getSource("imported") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geojson);

        // Fit map to imported features
        const bounds = new mapboxgl.LngLatBounds();
        geojson.features.forEach((feature: any) => {
          if (feature.geometry.type === "Point") {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          } else if (feature.geometry.type === "LineString") {
            feature.geometry.coordinates.forEach((coord: [number, number]) => {
              bounds.extend(coord);
            });
          } else if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
              bounds.extend(coord);
            });
          }
        });

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
        });

        toast.success(`Imported ${geojson.features.length} features successfully`);
      }
    } catch (error) {
      toast.error("Failed to import GeoJSON file");
      console.error("Error importing GeoJSON:", error);
    }
  };

  const handleResetView = () => {
    map.current?.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      essential: true,
    });
  };

  return (
    <div className="flex-1 relative">
      <DrawingTools onToolChange={setActiveTool} activeTool={activeTool} />
      <MapControls onFileImport={handleFileImport} onResetView={handleResetView} />
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}