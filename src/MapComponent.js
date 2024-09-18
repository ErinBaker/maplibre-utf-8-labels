import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import rawGeoJSON from "./data.json";

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    const addGeometry = (geojson) => {
      geojson.features.forEach((feature) => {
        const lat = parseFloat(feature.properties.latitude);
        const lon = parseFloat(feature.properties.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          feature.geometry = {
            type: "Point",
            coordinates: [lon, lat],
          };
        } else {
          feature.geometry = null;
        }
      });
      return geojson;
    };

    const processedGeoJSON = addGeometry(rawGeoJSON);

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/aquarelle/style.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
      zoom: 5,
      center: [11.39085, 47.27574],
      maxPitch: 85,
      antialias: true,
    });

    map.current.addControl(new maplibregl.NavigationControl());

    map.current.on("load", () => {
      map.current.addSource("sentences", {
        type: "geojson",
        data: processedGeoJSON,
      });

      map.current.addLayer({
        id: "sentence-labels",
        type: "symbol",
        source: "sentences",
        layout: {
          "text-field": ["get", "sentence"],
          "text-size": 11,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-allow-overlap": true,
          "text-ignore-placement": false,
          "text-max-width": 18,
          "text-keep-upright": false,
        },
        paint: {
          "text-color": "#252323",
          "text-halo-color": "#EAFDF8",
          "text-halo-width": 3,
        },
      });

      map.current.addLayer({
        id: "sentence-markers",
        type: "circle",
        source: "sentences",
        paint: {
          "circle-radius": 6,
          "circle-color": "#2f6690",
          "circle-opacity": 1,
          "circle-stroke-color": "#F5F1ED",
          "circle-stroke-width": 5,
          "circle-stroke-opacity": 0.5,
          "circle-pitch-scale": "map",
        },
      });

      map.current.on("click", "sentence-markers", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const sentence = e.features[0].properties.sentence;
        const language = e.features[0].properties.language;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<strong>Sentence:</strong> ${sentence}<br><strong>Language:</strong> ${language}`,
          )
          .addTo(map.current);
      });

      map.current.on("mouseenter", "sentence-markers", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "sentence-markers", () => {
        map.current.getCanvas().style.cursor = "";
      });

      // Apply initial filter
      applyFilter(filter);
    });

    maplibregl.setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      true,
    );
  }, [filter]); // Add filter to the dependency array

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      applyFilter(filter);
    }
  }, [filter]);

  const applyFilter = (currentFilter) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    let filterExpression;

    switch (currentFilter) {
      case "mango":
        filterExpression = ["==", ["get", "mango"], "TRUE"];
        break;
      case "maplibre":
        filterExpression = ["==", ["get", "maplibre"], "TRUE"];
        break;
      case "maptiler":
        filterExpression = ["==", ["get", "maptiler"], "TRUE"];
        break;
      default:
        filterExpression = ["!=", ["get", "mango"], "fakevalue"]; // This will show all features
    }

    map.current.setFilter("sentence-markers", filterExpression);
    map.current.setFilter("sentence-labels", filterExpression);
  };

  return (
    <div>
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}
      />
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="all">Show All</option>
          <option value="mango">Mango</option>
          <option value="maplibre">Maplibre</option>
          <option value="maptiler">Maptiler</option>
        </select>
      </div>
    </div>
  );
};

export default MapComponent;
