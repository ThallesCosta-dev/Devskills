import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Users, Briefcase, UserCircle, LogOut, Activity, Bell, Check, BookOpen } from 'lucide-react';
import axios from 'axios';
import './Navbar.css';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('auth_token');
  const authToken = localStorage.getItem('auth_token');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = () => {
    axios.get('/api/notifications/unread', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(res => setNotifications(res.data))
      .catch(err => console.error("Erro ao buscar notificações", err));
  };

  const markAllAsRead = () => {
    axios.put('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(() => setNotifications([]))
      .catch(err => console.error(err));
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Terminal size={20} /> },
    { name: 'Timeline', path: '/timeline', icon: <Activity size={20} /> },
    { name: 'Comunidade', path: '/community', icon: <Users size={20} /> },
    { name: 'Mercado', path: '/market', icon: <Briefcase size={20} /> },
    { name: 'Guia', path: '/guide', icon: <BookOpen size={20} /> },
  ];

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
            <div className="flex gap-sm items-center">
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotif(!showNotif)} 
                  className="btn btn-outline" 
                  style={{ padding: '0.75rem', position: 'relative' }} 
                  title="Notificações"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotif && (
                  <div className="glass-panel" style={{ position: 'absolute', top: '50px', right: '0', width: '320px', padding: '16px', zIndex: 100, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', background: 'var(--bg-surface)' }}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold">Notificações</h3>
                      {notifications.length > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary-light flex items-center gap-1 hover:underline">
                          <Check size={14} /> Marcar lidas
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted text-center py-4">Nenhuma notificação nova.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 bg-secondary bg-opacity-20 rounded-md hover:bg-opacity-30 cursor-pointer transition-colors" onClick={() => {
                            if(n.link) navigate(n.link);
                            setShowNotif(false);
                          }}>
                            <p className="text-sm text-secondary leading-snug">{n.message}</p>
                            <span className="text-xs text-muted mt-1 block">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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
