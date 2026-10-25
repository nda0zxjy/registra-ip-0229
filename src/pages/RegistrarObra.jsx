import { useEffect, useState } from "react";
import "./RegistrarObra.css";

const API_URL = "http://localhost:4000";
const FOLIO_PREFIX = "0229"; 
const CATEGORIAS = ["Literatura", "Música", "Fotografía", "Arte visual", "Software", "Otro"];
const PASOS = ["Archivo", "Metadatos", "Vista previa", "Confirmación"];
const DATOS_INICIALES = { archivo: null, titulo: "", categoria: "", descripcion: "" };

function generarFolio() {
  const f = new Date();
  const fecha = `${f.getFullYear()}${String(f.getMonth() + 1).padStart(2, "0")}${String(
    f.getDate()
  ).padStart(2, "0")}`;
  const azar = Math.floor(1000 + Math.random() * 9000);
  return `${FOLIO_PREFIX}-${fecha}-${azar}`;
}

function formatearTamano(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Regla de validación de cada paso
function validarPaso(paso, datos) {
  if (paso === 1) return Boolean(datos.archivo);
  if (paso === 2) return datos.titulo.trim().length >= 5 && datos.categoria !== "";
  return true;
}

function mensajeBloqueo(paso, datos) {
  if (paso === 1 && !datos.archivo) return "Selecciona un archivo para continuar.";
  if (paso === 2) {
    if (datos.titulo.trim().length < 5) return "El título necesita al menos 5 caracteres.";
    if (!datos.categoria) return "Elige una categoría para continuar.";
  }
  return "";
}

function BarraProgreso({ paso }) {
  return (
    <ol className="wizard-progreso" aria-label="Progreso del registro">
      {PASOS.map((nombre, i) => {
        const numero = i + 1;
        const estado = numero < paso ? "hecho" : numero === paso ? "activo" : "";
        return (
          <li
            key={nombre}
            className={`wizard-paso ${estado}`}
            aria-current={numero === paso ? "step" : undefined}
          >
            <span className="wizard-circulo">{numero < paso ? "✓" : numero}</span>
            <span className="wizard-nombre">{nombre}</span>
          </li>
        );
      })}
    </ol>
  );
}

function PasoArchivo({ datos, actualizar }) {
  return (
    <div className="form-group">
      <label htmlFor="archivo">Archivo de la obra</label>
      <input
        id="archivo"
        type="file"
        onChange={(e) => actualizar("archivo", e.target.files[0] || null)}
      />
      {datos.archivo && (
        <p className="wizard-archivo">
          {datos.archivo.name} · {formatearTamano(datos.archivo.size)}
        </p>
      )}
    </div>
  );
}

function PasoMetadatos({ datos, actualizar }) {
  const faltan = Math.max(0, 5 - datos.titulo.trim().length);
  return (
    <>
      <div className="form-group">
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          type="text"
          value={datos.titulo}
          onChange={(e) => actualizar("titulo", e.target.value)}
        />
        {faltan > 0 && (
          <span className="wizard-ayuda">
            Faltan {faltan} {faltan === 1 ? "carácter" : "caracteres"} como mínimo.
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="categoria">Categoría</label>
        <select
          id="categoria"
          value={datos.categoria}
          onChange={(e) => actualizar("categoria", e.target.value)}
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción (opcional)</label>
        <textarea
          id="descripcion"
          rows="4"
          value={datos.descripcion}
          onChange={(e) => actualizar("descripcion", e.target.value)}
        />
      </div>
    </>
  );
}

function PasoVistaPrevia({ datos, autor }) {
  const [urlImagen, setUrlImagen] = useState(null);

  useEffect(() => {
    if (!datos.archivo?.type.startsWith("image/")) return;

    const url = URL.createObjectURL(datos.archivo);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrlImagen(url);
    return () => URL.revokeObjectURL(url);
  }, [datos.archivo]);
  return (
    <>
      {urlImagen && <img className="wizard-imagen" src={urlImagen} alt="Vista previa de la obra" />}
      <div className="profile-details">
        <p>
          <strong>Archivo:</strong> {datos.archivo.name} ({formatearTamano(datos.archivo.size)})
        </p>
        <p>
          <strong>Título:</strong> {datos.titulo.trim()}
        </p>
        <p>
          <strong>Categoría:</strong> {datos.categoria}
        </p>
        <p>
          <strong>Descripción:</strong> {datos.descripcion.trim() || "Sin descripción"}
        </p>
        <p>
          <strong>Autor:</strong> {autor}
        </p>
      </div>
    </>
  );
}

export default function RegistrarObra() {
  const usuarioGuardado = localStorage.getItem("registraIpUsuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const autor = usuario?.nombre || usuario?.correo || "Anónimo";
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState(DATOS_INICIALES); // un solo estado para todo el wizard
  const [folio, setFolio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const actualizar = (campo, valor) => setDatos((previo) => ({ ...previo, [campo]: valor }));
  const valido = validarPaso(paso, datos);

  const siguiente = () => {
    if (valido) setPaso((p) => p + 1);
  };

  const enviar = async () => {
    setEnviando(true);
    setError("");

    const formData = new FormData();
    formData.append("archivo", datos.archivo);
    formData.append("folio", generarFolio());
    formData.append("titulo", datos.titulo.trim());
    formData.append("categoria", datos.categoria);
    formData.append("descripcion", datos.descripcion.trim());
    formData.append("autor", autor);

    try {
      const respuesta = await fetch(`${API_URL}/obras`, { method: "POST", body: formData });
      const json = await respuesta.json();
      if (!respuesta.ok) throw new Error(json.error || "No se pudo registrar la obra.");
      setFolio(json.obra.folio);
      setPaso(4);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "No se pudo conectar con el servidor. Revisa que esté corriendo en el puerto 4000."
          : e.message
      );
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setDatos(DATOS_INICIALES);
    setFolio("");
    setError("");
    setPaso(1);
  };

  return (
    <section className="form-card wizard">
      <h2>Registrar obra</h2>
      <BarraProgreso paso={paso} />

      {paso === 1 && <PasoArchivo datos={datos} actualizar={actualizar} />}
      {paso === 2 && <PasoMetadatos datos={datos} actualizar={actualizar} />}
      {paso === 3 && <PasoVistaPrevia datos={datos} autor={autor} />}
      {paso === 4 && (
        <div className="wizard-confirmacion">
          <p className="form-description">Tu obra quedó registrada. Guarda este folio:</p>
          <p className="wizard-folio">{folio}</p>
          <button type="button" className="primary-button" onClick={reiniciar}>
            Registrar otra obra
          </button>
        </div>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {paso < 4 && (
        <>
          {!valido && (
            <p className="wizard-ayuda" role="status">
              {mensajeBloqueo(paso, datos)}
            </p>
          )}
          <div className="wizard-acciones">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPaso((p) => p - 1)}
              disabled={paso === 1 || enviando}
            >
              Atrás
            </button>
            {paso < 3 ? (
              <button type="button" className="primary-button" onClick={siguiente} disabled={!valido}>
                Siguiente
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={enviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Confirmar y enviar"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
