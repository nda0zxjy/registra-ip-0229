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

          <Route path="*" element={<Navigate to="/registro" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



export default App;