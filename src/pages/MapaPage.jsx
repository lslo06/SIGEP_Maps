import { useCallback, useState } from "react"
import {
  Map as MapIcon,
  MapPinned,
  Mountain,
  Satellite,
  Server,
} from "lucide-react"
import MapCanvas from "../components/map/MapCanvas"
import PredioSearch from "../components/map/PredioSearch"
import {
  ConnectionStatus,
  CoverageNotice,
  WmsWarning,
} from "../components/map/MapStatus"
import { BASEMAPS, isWmsConfigured, wmsConfig } from "../config/map"
import "leaflet/dist/leaflet.css"

export default function MapaPage() {
  const [status, setStatus] = useState(
    isWmsConfigured ? "connecting" : "unconfigured",
  )
  const [basemap, setBasemap] = useState("streets")
  const [searchFeature, setSearchFeature] = useState(null)
  const handleWmsLoad = useCallback(() => setStatus("connected"), [])
  const handleWmsError = useCallback(() => setStatus("error"), [])

  const basemapOptions = [
    { id: "streets", label: "Calles", detail: "QGIS Server", Icon: MapIcon },
    {
      id: "satellite",
      label: "Satélite",
      detail: "QGIS Server",
      Icon: Satellite,
    },
    {
      id: "topographic",
      label: "Topográfico",
      detail: "QGIS Server",
      Icon: Mountain,
    },
  ]

  return (
    <main className="map-page">
      <header className="page-header">
        <div className="brand">
          <div className="brand-mark">DGO</div>
          <div>
            <strong>Gestión territorial</strong>
            <span>Módulo cartográfico</span>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="section-title">
          <div>
            <span>INFORMACIÓN GEOGRÁFICA</span>
            <h1>Mapa territorial</h1>
            <p>
              Consulta la cartografía disponible y la conexión al servicio
              geográfico.
            </p>
          </div>
          <ConnectionStatus status={status} />
        </div>

        <CoverageNotice />
        <WmsWarning status={status} />

        <section className="basemap-picker" aria-label="Elegir tipo de mapa">
          <div className="basemap-picker-heading">
            <strong>Tipo de mapa</strong>
            <span>Selecciona el fondo cartográfico</span>
          </div>
          <div
            className="basemap-options"
            role="group"
            aria-label="Mapas de fondo"
          >
            {basemapOptions.map(({ id, label, detail, Icon }) => (
              <button
                className={`basemap-option ${basemap === id ? "selected" : ""}`}
                type="button"
                key={id}
                aria-pressed={basemap === id}
                onClick={() => setBasemap(id)}
              >
                <Icon size={18} />
                <span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <PredioSearch onResult={setSearchFeature} />

        <MapCanvas
          basemap={basemap}
          searchFeature={searchFeature}
          onWmsLoad={handleWmsLoad}
          onWmsError={handleWmsError}
        />

        <div className="map-meta">
          <article>
            <MapPinned size={19} />
            <div>
              <span>CENTRO INICIAL</span>
              <strong>Durango, México</strong>
              <small>24.56° N, 104.68° O · Zoom 7</small>
            </div>
          </article>
          <article>
            <Server size={19} />
            <div>
              <span>ORIGEN DE DATOS</span>
              <strong>QGIS Server · WMS</strong>
              <small>
                {isWmsConfigured
                  ? BASEMAPS[basemap].layer
                  : "Capa pendiente de configurar"}
              </small>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
