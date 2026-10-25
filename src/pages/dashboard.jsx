
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("registraIpUsuario");
  const usuario = JSON.parse(usuarioGuardado);

  function cerrarSesion() {
    localStorage.removeItem("registraIpUsuario");
    navigate("/", { replace: true });
  }

  return (
    <section className="dashboard-card">
      <p className="dashboard-eyebrow">REGISTRA-IP</p>

      <h2>¡Hola, {usuario.nombre}!</h2>

      <p>
        Tu registro se realizó correctamente. Nos alegra tenerte aquí.
      </p>

      <div className="profile-details">
        <p>
          <strong>Correo:</strong> {usuario.correo}
        </p>
        <p>
          <strong>Tipo de creador:</strong> {usuario.tipoCreador}
        </p>
      </div>

      <button
        type="button"
        className="secondary-button"
        onClick={cerrarSesion}
      >
        Cerrar sesión
      </button>
    </section>
  );
}

export default Dashboard;
