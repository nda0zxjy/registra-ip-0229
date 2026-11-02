import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import RegistrarObra from "./pages/RegistrarObra";
import RutaProtegida from "./components/RutaProtegida";
import Obras from "./pages/Obras";
import ObraDetalle from "./pages/ObraDetalle";
import Galeria from "./pages/Galeria";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={<Navigate to="/registro" replace />}
          />

          <Route path="registro" element={<Registro />} />

          <Route
            path="dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />

<Route path="registrar-obra" element={<RegistrarObra />} />
          <Route
            path="registrar-obra"
            element={
              <RutaProtegida>
                <RegistrarObra />
              </RutaProtegida>
            }
          />

          <Route path="obras" element={<RutaProtegida><Obras /></RutaProtegida>} />
          <Route path="obras/:folio" element={<RutaProtegida><ObraDetalle /></RutaProtegida>} />
          <Route path="galeria" element={<RutaProtegida><Galeria /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/registro" replace />} />
          </Route>
      </Routes>
    </BrowserRouter>
  );
}



export default App;