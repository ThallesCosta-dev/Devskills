import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Users, Briefcase, UserCircle, LogOut } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Terminal size={20} /> },
    { name: 'Comunidade', path: '/community', icon: <Users size={20} /> },
    { name: 'Mercado', path: '/market', icon: <Briefcase size={20} /> },
  ];

  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('auth_token');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <nav className="glass-panel navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <Terminal className="brand-icon" size={28} />
          <span className="text-gradient">DevSkills</span>
        </Link>
        
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="nav-profile">
          {isAuthenticated ? (
            <div className="flex gap-sm">
              <Link to="/profile/me" className="btn btn-outline">
                <UserCircle size={20} />
                Meu Perfil
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.75rem' }} title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
