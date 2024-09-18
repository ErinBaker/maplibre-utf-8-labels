import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import rawGeoJSON from "./data.json";

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

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
      center: [0, 0],
      zoom: 0,
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
          "text-field": [
            "concat",
            ["get", "sentence"],
            "\nLanguage: ",
            ["get", "language"],
            "\nMango: ",
            ["get", "mango"],
            "\nMaplibre: ",
            ["get", "maplibre"],
            "\nMaptiler: ",
            ["get", "maptiler"],
          ],
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
        const mango = e.features[0].properties.mango;
        const maplibre = e.features[0].properties.maplibre;
        const maptiler = e.features[0].properties.maptiler;

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
    });

    maplibregl.setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      true,
    );
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}
    />
  );
};

export default MapComponent;
