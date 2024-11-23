"use client";

import { useCallback, useRef } from "react";
import type { Map } from "mapbox-gl";
import * as turf from "@turf/turf";

export type DrawingType = "point" | "line" | "straightLine" | "polygon";

export function useDrawing(mapRef: React.RefObject<Map | null>) {
  const currentLine = useRef<number[][]>([]);
  const features = useRef<GeoJSON.Feature[]>([]);
  const tempFeature = useRef<GeoJSON.Feature | null>(null);

  const updateSource = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("drawing") as mapboxgl.GeoJSONSource;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: [...features.current, ...(tempFeature.current ? [tempFeature.current] : [])],
    });
  }, []);

  const startDrawing = useCallback((coordinates: number[], type: DrawingType) => {
    if (type === "point") {
      features.current.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates,
        },
        properties: { type: "point" },
      });
      updateSource();
    } else if (type === "line" || type === "straightLine") {
      currentLine.current = [coordinates];
      if (type === "straightLine") {
        tempFeature.current = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [coordinates, coordinates],
          },
          properties: { type: "straightLine" },
        };
        updateSource();
      }
    }
  }, [updateSource]);

  const continueDrawing = useCallback((coordinates: number[], type: DrawingType) => {
    if (type === "straightLine") {
      if (currentLine.current.length === 1) {
        tempFeature.current = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [currentLine.current[0], coordinates],
          },
          properties: { type: "straightLine" },
        };
        updateSource();
      }
    } else if (type === "line") {
      currentLine.current.push(coordinates);
      
      if (currentLine.current.length > 1) {
        const lineFeature: GeoJSON.Feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: currentLine.current,
          },
          properties: { type: "line" },
        };

        features.current = features.current.filter(f => 
          f.geometry.type !== "LineString" || 
          JSON.stringify(f.geometry.coordinates) !== JSON.stringify(currentLine.current.slice(0, -1))
        );
        
        features.current.push(lineFeature);
        updateSource();
      }
    }
  }, [updateSource]);

  const finishDrawing = useCallback((type: DrawingType) => {
    if (type === "straightLine" && currentLine.current.length === 1 && tempFeature.current) {
      features.current.push(tempFeature.current);
    }
    currentLine.current = [];
    tempFeature.current = null;
    updateSource();
  }, [updateSource]);

  return {
    startDrawing,
    continueDrawing,
    finishDrawing,
  };
}