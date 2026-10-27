import { Search } from "lucide-react"
import { useState } from "react"

export default function PredioSearch({ onResult }) {
  const [clave, setClave] = useState("")
  const [feature, setFeature] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const query = clave.trim()
    if (!query) {
      setMessage("Escribe una clave catastral para buscar.")
      return
    }

    setLoading(true)
    setMessage("")
    setFeature(null)
    onResult(null)

    try {
      const response = await fetch(`/api/predios?clave=${encodeURIComponent(query)}`)
      const payload = await response.json().catch(() => ({}))

      if (response.status === 404) {
        setMessage("No se encontró un predio con esa clave.")
        return
      }
      if (!response.ok) {
        throw new Error(payload.error || "No fue posible consultar la base de datos.")
      }

      setFeature(payload)
      onResult(payload)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No fue posible conectar con el servicio de búsqueda.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="predio-search" onSubmit={handleSubmit}>
      <div className="predio-search-main">
        <label className="predio-search-title" htmlFor="clave-catastral">
          Buscar predio por clave catastral
        </label>
        <div className="predio-search-controls">
          <input
            id="clave-catastral"
            name="clave-catastral"
            value={clave}
            onChange={(event) => setClave(event.target.value)}
            placeholder="Escribe la clave catastral"
            autoComplete="off"
            maxLength={100}
          />
          <button type="submit" disabled={loading}>
            <Search size={15} /> {loading ? "Buscando…" : "Buscar"}
          </button>
        </div>
        {message && <p className="predio-search-message" role="status">{message}</p>}
      </div>
      {feature && (
        <div className="predio-search-result" aria-live="polite">
          <strong>Predio encontrado</strong>
          Clave: {feature.properties.clave_catastral}
          {feature.properties.municipio && <> · {feature.properties.municipio}</>}
          {feature.properties.fundo && <> · Fundo {feature.properties.fundo}</>}
          {feature.properties.manzana && <> · Mz. {feature.properties.manzana}</>}
          {feature.properties.lote && <> · Lote {feature.properties.lote}</>}
        </div>
      )}
    </form>
  )
}
