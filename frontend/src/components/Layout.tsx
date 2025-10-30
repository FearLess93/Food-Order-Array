import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

export const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/voting" className="navbar-brand">
            🍕 Array Eats
          </Link>
          <div className="navbar-menu">
            <Link to="/voting" className="navbar-link">Vote</Link>
            <Link to="/group-order" className="navbar-link">Group Order</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="navbar-link">Admin</Link>
            )}
          </div>
          <div className="navbar-user">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
