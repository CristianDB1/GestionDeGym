import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, removeUserSession } from '../Utils/auth.js';
import { getUsuarios } from '../Service/api.js';
import '../styles/Home.css';

const Home = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();
  const currentUser = getUserSession();

  // Verificar si hay una sesión activa
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios();
        setUsuarios(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleLogout = () => {
    removeUserSession();
    navigate('/login');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="home-container">
      {/* Navbar lateral izquierdo */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>GymSystem</h3>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">
            <img src="/api/placeholder/50/50" alt="avatar" />
          </div>
          <div className="user-info">
            <p>{currentUser.nombre} {currentUser.apellido}</p>
            <span className="user-role">{currentUser.rol}</span>
          </div>
        </div>
        <ul className="sidebar-menu">
          <li className={activeMenu === 'dashboard' ? 'active' : ''} onClick={() => handleMenuClick('dashboard')}>
            <i className="menu-icon">📊</i>
            <span>Dashboard</span>
          </li>
          <li className={activeMenu === 'usuarios' ? 'active' : ''} onClick={() => handleMenuClick('usuarios')}>
            <i className="menu-icon">👥</i>
            <span>Usuarios</span>
          </li>
          <li className={activeMenu === 'miembros' ? 'active' : ''} onClick={() => handleMenuClick('miembros')}>
            <i className="menu-icon">🏋️</i>
            <span>Miembros</span>
          </li>
          <li className={activeMenu === 'pagos' ? 'active' : ''} onClick={() => handleMenuClick('pagos')}>
            <i className="menu-icon">💰</i>
            <span>Pagos</span>
          </li>
          <li className={activeMenu === 'clases' ? 'active' : ''} onClick={() => handleMenuClick('clases')}>
            <i className="menu-icon">🗓️</i>
            <span>Clases</span>
          </li>
          <li className={activeMenu === 'configuracion' ? 'active' : ''} onClick={() => handleMenuClick('configuracion')}>
            <i className="menu-icon">⚙️</i>
            <span>Configuración</span>
          </li>
          <li className="logout-item" onClick={handleLogout}>
            <i className="menu-icon">🚪</i>
            <span>Cerrar Sesión</span>
          </li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <div className="main-content">
        <header className="main-header">
          <h1>
            {activeMenu === 'dashboard' && 'Dashboard'}
            {activeMenu === 'usuarios' && 'Gestión de Usuarios'}
            {activeMenu === 'miembros' && 'Gestión de Miembros'}
            {activeMenu === 'pagos' && 'Gestión de Pagos'}
            {activeMenu === 'clases' && 'Gestión de Clases'}
            {activeMenu === 'configuracion' && 'Configuración del Sistema'}
          </h1>
        </header>

        <main className="content-area">
          {activeMenu === 'dashboard' && (
            <div className="dashboard-widgets">
              <div className="widget">
                <h3>Total Usuarios</h3>
                <div className="widget-content">
                  <p className="widget-number">{usuarios.length}</p>
                </div>
              </div>
              <div className="widget">
                <h3>Actividad Reciente</h3>
                <div className="widget-content">
                  <p>No hay actividad reciente</p>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'usuarios' && (
            <div className="users-section">
              <div className="section-header">
                <h2>Lista de Usuarios</h2>
                <button className="add-button">Añadir Usuario</button>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="users-list">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.length > 0 ? (
                      usuarios.map(usuario => (
                        <tr key={usuario.id}>
                          <td>{usuario.id}</td>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.apellido}</td>
                          <td>{usuario.email}</td>
                          <td>{usuario.rol}</td>
                          <td className="action-buttons">
                            <button className="edit-button">Editar</button>
                            <button className="delete-button">Eliminar</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>No hay usuarios registrados</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'miembros' && (
            <div className="section-placeholder">
              <h2>Gestión de Miembros</h2>
              <p>Contenido de gestión de miembros aquí</p>
            </div>
          )}

          {activeMenu === 'pagos' && (
            <div className="section-placeholder">
              <h2>Gestión de Pagos</h2>
              <p>Contenido de gestión de pagos aquí</p>
            </div>
          )}

          {activeMenu === 'clases' && (
            <div className="section-placeholder">
              <h2>Gestión de Clases</h2>
              <p>Contenido de gestión de clases aquí</p>
            </div>
          )}

          {activeMenu === 'configuracion' && (
            <div className="section-placeholder">
              <h2>Configuración del Sistema</h2>
              <p>Contenido de configuración aquí</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;