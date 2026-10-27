import { Info, TriangleAlert } from "lucide-react"

const labels = {
  connected: "WMS conectado",
  error: "WMS no disponible",
  connecting: "Conectando WMS…",
  unconfigured: "WMS sin configurar",
}

export function ConnectionStatus({ status }) {
  return (
    <div className={`connection connection-${status}`} role="status">
      <span />
      {labels[status]}
    </div>
  )
}

export function CoverageNotice() {
  return (
    <div className="map-notice">
      <Info size={19} />
      <p>
        <strong>Mapas de fondo disponibles</strong>
        Las vistas de calles, satélite y topográfico se solicitan a QGIS Server.
        Si el servidor no responde, el mapa no mostrará una fuente alternativa.
      </p>
    </div>
  )
}

export function WmsWarning({ status }) {
  if (status !== "error" && status !== "unconfigured") return null

  return (
    <div className="map-warning" role="alert">
      <TriangleAlert size={19} />
      <div>
        <strong>
          {status === "error"
            ? "No fue posible cargar el servicio WMS"
            : "Servicio WMS pendiente de configuración"}
        </strong>
        <p>
          {status === "error"
            ? "QGIS Server no respondió. No se cargará un mapa desde otro servicio."
            : "Configura las variables VITE_QGIS_* en tu archivo .env para mostrar las capas del servidor."}
        </p>
      </div>
    </div>
  )
}
