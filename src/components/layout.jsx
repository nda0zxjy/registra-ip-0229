
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container header-content">
          <h1 className="app-logo">REGISTRA-IP</h1>
          <span className="header-label">
            Registro de creadores
          </span>
        </div>
      </header>

      <main className="container app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>REGISTRA-IP · Plataforma de registro</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
