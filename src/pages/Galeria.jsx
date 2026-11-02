import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Galeria.css";

/*
 * ETAPA 1: galería base (grid responsivo + loader).
 * ISO 9241-110, retroalimentación: se muestra un loader mientras se obtienen
 * las obras del servidor.
 * ISO 9241-411: las tarjetas y el enlace de volver miden al menos 44 px.
 */

const API_URL = "http://localhost:4000";

function iconoPorTipo(tipo = "") {
  if (tipo.startsWith("video/")) return "🎬";
  if (tipo.startsWith("audio/")) return "🎵";
  if (tipo === "application/pdf") return "📄";
  if (tipo.startsWith("text/") || tipo.includes("word")) return "📝";
  return "📁";
}

function Miniatura({ obra }) {
  const tipo = obra.archivo?.tipo || "";
  if (tipo.startsWith("image/")) {
    return (
      <img
        className="galeria-img"
        src={`${API_URL}${obra.archivo.url}`}
        alt={`Miniatura de ${obra.titulo}`}
        loading="lazy"
      />
    );
  }
  return (
    <span className="galeria-icono" aria-hidden="true">
      {iconoPorTipo(tipo)}
    </span>
  );
}

export default function Galeria() {
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/obras`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error();
        return respuesta.json();
      })
      .then(setObras)
      .catch(() =>
        setError("No se pudieron cargar las obras. Revisa que el servidor esté corriendo.")
      )
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="galeria">
      <Link to="/dashboard" className="galeria-volver">
        ← Volver al panel
      </Link>
      <h2>Galería de obras</h2>

      {cargando && (
        <p className="galeria-estado" role="status">
          <span className="galeria-spinner" aria-hidden="true" />
          Cargando obras...
        </p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <ul className="galeria-grid">
        {obras.map((obra) => (
          <li key={obra.folio}>
            <Link to={`/obras/${obra.folio}`} className="galeria-tarjeta">
              <div className="galeria-miniatura">
                <Miniatura obra={obra} />
              </div>
              <div className="galeria-info">
                <span className="galeria-titulo">{obra.titulo}</span>
                <span className="galeria-autor">{obra.autor}</span>
                <span className="galeria-categoria">{obra.categoria}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
