import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Galeria.css";

/*
 * CRITERIOS DE USABILIDAD APLICADOS (ISO 9241)
 *
 * 1. ISO 9241-110, retroalimentación (autodescripción): mientras se obtienen
 *    las obras del servidor se muestra un loader con role="status", y al
 *    filtrar se indica cuántos resultados hay ("Mostrando X de Y obras").
 *    Así el usuario siempre sabe qué está pasando con el sistema.
 *
 * 2. ISO 9241-411 (dispositivos de entrada) y accesibilidad táctil: todos los
 *    elementos interactivos (buscador, botones de categoría, selector de
 *    orden, tarjetas) miden al menos 44x44 px, para tocarlos sin errores en
 *    pantallas táctiles. Los estilos están en Galeria.css.
 *
 * 3. ISO 9241-110, controlabilidad y tolerancia a errores: cuando una
 *    combinación de búsqueda y filtros no da resultados, se explica por qué
 *    y se ofrece el botón "Limpiar filtros" para volver al estado inicial.
 */

const API_URL = "http://localhost:4000";
const CATEGORIAS = ["Diseño", "Fotografía", "Escritura", "Cine"];

// Quita mayúsculas y acentos para que "musica" encuentre "Música"
function normalizar(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

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

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("recientes");

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

  // Búsqueda + categoría + orden, combinados
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return obras
      .filter((obra) => categoria === "Todas" || obra.categoria === categoria)
      .filter(
        (obra) =>
          !texto ||
          normalizar(obra.titulo).includes(texto) ||
          normalizar(obra.autor).includes(texto)
      )
      .sort((a, b) =>
        orden === "recientes"
          ? b.fechaRegistro.localeCompare(a.fechaRegistro)
          : a.fechaRegistro.localeCompare(b.fechaRegistro)
      );
  }, [obras, busqueda, categoria, orden]);

  const hayFiltros = busqueda.trim() !== "" || categoria !== "Todas";

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria("Todas");
  };

  return (
    <section className="galeria">
      <Link to="/dashboard" className="galeria-volver">
        ← Volver al panel
      </Link>
      <h2>Galería de obras</h2>

      {/* Controles: búsqueda, categoría y orden */}
      <div className="galeria-controles">
        <div className="galeria-campo">
          <label htmlFor="busqueda">Buscar por título o autor</label>
          <input
            id="busqueda"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe para buscar..."
          />
        </div>

        <div className="galeria-campo">
          <label htmlFor="orden">Ordenar por fecha</label>
          <select id="orden" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes primero</option>
            <option value="antiguas">Más antiguas primero</option>
          </select>
        </div>
      </div>

      <div className="galeria-filtros" role="group" aria-label="Filtrar por categoría">
        {["Todas", ...CATEGORIAS].map((nombre) => (
          <button
            key={nombre}
            type="button"
            className="filtro-btn"
            aria-pressed={categoria === nombre}
            onClick={() => setCategoria(nombre)}
          >
            {nombre}
          </button>
        ))}
      </div>

      {/* Retroalimentación: loader, error y conteo de resultados */}
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

      {!cargando && !error && (
        <p className="galeria-estado" role="status">
          Mostrando {visibles.length} de {obras.length} obras
        </p>
      )}

      {/* Estado vacío con salida clara */}
      {!cargando && !error && visibles.length === 0 && (
        <div className="galeria-vacio">
          <p>
            {hayFiltros
              ? "Ninguna obra coincide con la búsqueda y los filtros elegidos."
              : "Todavía no hay obras registradas."}
          </p>
          {hayFiltros && (
            <button type="button" className="secondary-button" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid responsivo */}
      <ul className="galeria-grid">
        {visibles.map((obra) => (
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
