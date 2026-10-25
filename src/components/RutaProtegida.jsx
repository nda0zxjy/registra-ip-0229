
import { Navigate } from "react-router-dom";

function RutaProtegida({ children }) {
  const usuarioGuardado = localStorage.getItem("registraIpUsuario");

  if (!usuarioGuardado) {
    return <Navigate to="/" replace />;
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);

    if (!usuario.nombre || !usuario.correo || !usuario.tipoCreador) {
      localStorage.removeItem("registraIpUsuario");
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem("registraIpUsuario");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;
