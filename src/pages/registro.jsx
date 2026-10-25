
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipoCreador, setTipoCreador] = useState("");
  const [errores, setErrores] = useState({});

  function handleSubmit(event) {
    event.preventDefault();

    const nuevosErrores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
    ) {
      nuevosErrores.correo =
        "Ingresa un correo electrónico válido.";
    }

    if (!tipoCreador) {
      nuevosErrores.tipoCreador =
        "Selecciona un tipo de creador.";
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    const usuario = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      tipoCreador,
    };

    localStorage.setItem(
      "registraIpUsuario",
      JSON.stringify(usuario)
    );

    navigate("/dashboard");
  }

  return (
    <section className="form-card">
      <h2>Registro de creador</h2>
      <p className="form-description">
        Registra tus datos para comenzar.
      </p>

      <div aria-live="polite" className="error-summary">
        {Object.values(errores).map((error, index) => (
          <p key={index} className="error-message">
            {error}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
            placeholder="Escribe tu nombre"
            autoComplete="name"
          />
          {errores.nombre && (
            <span id="error-nombre" className="error-message">
              {errores.nombre}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            aria-invalid={Boolean(errores.correo)}
            aria-describedby={errores.correo ? "error-correo" : undefined}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
          {errores.correo && (
            <span id="error-correo" className="error-message">
              {errores.correo}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tipoCreador">Tipo de creador</label>
          <select
            id="tipoCreador"
            value={tipoCreador}
            onChange={(event) => setTipoCreador(event.target.value)}
            aria-invalid={Boolean(errores.tipoCreador)}
            aria-describedby={
              errores.tipoCreador ? "error-tipo" : undefined
            }
          >
            <option value="">Selecciona una opción</option>
            <option value="Diseñador">Diseñador</option>
            <option value="Fotógrafo">Fotógrafo</option>
            <option value="Escritor">Escritor</option>
            <option value="Cineasta">Cineasta</option>
          </select>
          {errores.tipoCreador && (
            <span id="error-tipo" className="error-message">
              {errores.tipoCreador}
            </span>
          )}
        </div>

        <button type="submit" className="primary-button">
          Registrarme
        </button>
      </form>
    </section>
  );
}

export default Registro;
