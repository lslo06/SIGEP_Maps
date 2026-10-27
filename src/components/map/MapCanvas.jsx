import { Crosshair, MousePointer2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import {
  GeoJSON,
  MapContainer,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import {
  MAP_CENTER,
  MAP_ZOOM,
  BASEMAPS,
  isWmsConfigured,
  wmsConfig,
} from "../../config/map"

function MapControls({ onCoordinatesChange }) {
  const map = useMap()

  useMapEvents({
    mousemove: ({ latlng }) =>
      onCoordinatesChange(`${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`),
    mouseout: () => onCoordinatesChange("Mueve el cursor sobre el mapa"),
  })

  return (
    <button
      className="center-map"
      type="button"
      onClick={() => map.setView(MAP_CENTER, MAP_ZOOM)}
    >
      <Crosshair size={17} />
      Centrar en Durango
    </button>
  )
}

function ZoomToFeature({ feature }) {
  const map = useMap()

  useEffect(() => {
    if (!feature) return
    const bounds = L.geoJSON(feature).getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 19 })
  }, [feature, map])

  return null
}

const predioStyle = {
  color: "#b63f2f",
  weight: 3,
  opacity: 1,
  fillColor: "#e66a4d",
  fillOpacity: 0.28,
}

export default function MapCanvas({
  basemap,
  searchFeature,
  onWmsLoad,
  onWmsError,
}) {
  const [coordinates, setCoordinates] = useState(
    "Mueve el cursor sobre el mapa",
  )
  const wmsParams = useMemo(
    () => ({
      MAP: wmsConfig.map,
      layers: BASEMAPS[basemap].layer,
      format: "image/png",
      transparent: false,
      version: "1.3.0",
    }),
    [basemap],
  )
  const wmsEventHandlers = useMemo(
    () => ({ load: onWmsLoad, tileerror: onWmsError }),
    [onWmsLoad, onWmsError],
  )

  return (
    <div className="map-shell">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        scrollWheelZoom
        className="leaflet-map"
      >
        {isWmsConfigured && (
          <WMSTileLayer
            key={basemap}
            url={wmsConfig.url}
            params={wmsParams}
            attribution={BASEMAPS[basemap].attribution}
            eventHandlers={wmsEventHandlers}
          />
        )}

        {searchFeature && (
          <>
            <GeoJSON
              key={searchFeature.properties.clave_catastral}
              data={searchFeature}
              style={predioStyle}
            />
            <ZoomToFeature feature={searchFeature} />
          </>
        )}

        <MapControls onCoordinatesChange={setCoordinates} />
      </MapContainer>

      <div className="coordinates" aria-live="polite">
        <MousePointer2 size={15} />
        <span>Coordenadas</span>
        <strong>{coordinates}</strong>
      </div>
    </div>
  )
}
