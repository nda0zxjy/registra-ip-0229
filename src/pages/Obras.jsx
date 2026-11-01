import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Obras.css";

const API_URL = "http://localhost:4000";

export default function Obras() {
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
    <section className="form-card">
      <Link to="/dashboard">← Volver al panel</Link>
      <h2>Mis obras</h2>

      {cargando && <p className="form-description">Cargando...</p>}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {!cargando && !error && obras.length === 0 && (
        <p className="form-description">Todavía no hay obras registradas.</p>
      )}

      <ul className="obras-lista">
        {obras.map((obra) => (
          <li key={obra.folio}>
            <Link to={`/obras/${obra.folio}`} className="obra-item">
              <span className="obra-titulo">{obra.titulo}</span>
              <span className="obra-meta">
                {obra.categoria} · {obra.folio}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
