import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { generarCertificado } from "../utils/generarCertificado";
import "./Obras.css";

const API_URL = "http://localhost:4000";

export default function ObraDetalle() {
  const { folio } = useParams();
  const [obra, setObra] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/obras/${encodeURIComponent(folio)}`)
      .then((respuesta) => {
        if (respuesta.status === 404) throw new Error("No existe una obra con ese folio.");
        if (!respuesta.ok) throw new Error("No se pudo cargar la obra.");
        return respuesta.json();
      })
      .then(setObra)
      .catch((e) =>
        setError(
          e instanceof TypeError
            ? "No se pudo conectar con el servidor. Revisa que esté corriendo en el puerto 4000."
            : e.message
        )
      )
      .finally(() => setCargando(false));
  }, [folio]);

  const descargar = async () => {
    setGenerando(true);
    setError("");
    try {
      await generarCertificado(obra);
    } catch {
      setError("No se pudo generar el certificado.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <section className="form-card">
      <Link to="/obras">← Volver a mis obras</Link>

      {cargando && <p className="form-description">Cargando...</p>}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {obra && (
        <>
          <h2>{obra.titulo}</h2>

          {obra.archivo.tipo.startsWith("image/") && (
            <img
              className="wizard-imagen"
              src={`${API_URL}${obra.archivo.url}`}
              alt={`Archivo de la obra ${obra.titulo}`}
            />
          )}

          <div className="profile-details">
            <p>
              <strong>Folio:</strong> {obra.folio}
            </p>
            <p>
              <strong>Autor:</strong> {obra.autor}
            </p>
            <p>
              <strong>Categoría:</strong> {obra.categoria}
            </p>
            <p>
              <strong>Descripción:</strong> {obra.descripcion || "Sin descripción"}
            </p>
            <p>
              <strong>Archivo:</strong> {obra.archivo.nombreOriginal}
            </p>
            <p>
              <strong>Fecha de registro:</strong>{" "}
              {new Date(obra.fechaRegistro).toLocaleString("es-MX")}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={descargar}
            disabled={generando}
          >
            {generando ? "Generando..." : "Descargar certificado"}
          </button>
        </>
      )}
    </section>
  );
}
