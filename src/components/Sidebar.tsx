import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { API_V1_URL } from '../config';
import { PanelLeftClose, PanelLeftOpen, Home, FolderOpen, LogIn, Users, UserCircle, Layout, FolderCog, Users2, Settings, Instagram, Twitter, Camera } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [showDot, setShowDot] = useState(false);

    const fetchUser = () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            fetch(`${API_V1_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.username) {
                        setUser(data);
                        if (data.role === 'Admin') {
                            fetchPendingCount(currentToken);
                        }
                    }
                })
                .catch(err => console.error("Error fetching user:", err));
        } else {
            setUser(null);
            setPendingCount(0);
            setShowDot(false);
        }
    };

    const fetchPendingCount = (token: string) => {
        fetch(`${API_V1_URL}/utils/pending-counts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (typeof data.total === 'number') {
                    if (data.total > pendingCount) {
                        setShowDot(true);
                    }
                    setPendingCount(data.total);

                    if (location.pathname === '/admin/configuracion') {
                        setShowDot(false);
                    }
                }
            })
            .catch(err => console.error("Error fetching pending counts:", err));
    };

    useEffect(() => {
        fetchUser();

        // Refresh pending count every 5 minutes if admin
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token && user?.role === 'Admin') {
                fetchPendingCount(token);
            }
        }, 1000 * 60 * 5);

        window.addEventListener('authChange', fetchUser);
        window.addEventListener('storage', fetchUser);
        return () => {
            clearInterval(interval);
            window.removeEventListener('authChange', fetchUser);
            window.removeEventListener('storage', fetchUser);
        };
    }, []);

    useEffect(() => {
        if (location.pathname === '/admin/configuracion') {
            setShowDot(false);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authChange'));
        setUser(null);
        navigate('/login');
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="toggle-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <Link to="/" className="logo-container">
                <img src="/logo.png" alt="Logo" />
            </Link>


            {user && (
                <div className="sidebar-user-header">
                    <NavLink to="/perfil" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <UserCircle size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Mi Perfil</span>
                    </NavLink>
                    <div className="sidebar-separator"></div>
                </div>
            )}

            <nav style={{ flex: 1 }}>
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <Home size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                    <span className="nav-span">Inicio</span>
                </NavLink>
                <NavLink to="/proyectos" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <FolderOpen size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                    <span className="nav-span">Proyectos</span>
                </NavLink>
                <NavLink to="/nosotros" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <Users size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                    <span className="nav-span">Nosotros</span>
                </NavLink>

                <NavLink to="/comunidad" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <Camera size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                    <span className="nav-span">Momentos</span>
                </NavLink>

                {user?.role === 'Admin' && (
                    <>
                        <div className="sidebar-separator"></div>
                        <div className="sidebar-section-label" style={{
                            padding: '10px 15px',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            display: isCollapsed ? 'none' : 'block'
                        }}>
                            Editar Paneles
                        </div>
                        <NavLink to="/admin/inicio" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <Layout size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                            <span className="nav-span">Inicio</span>
                        </NavLink>
                        <NavLink to="/admin/proyectos" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <FolderCog size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                            <span className="nav-span">Proyectos</span>
                        </NavLink>
                        <NavLink to="/admin/nosotros" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <Users2 size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                            <span className="nav-span">Nosotros</span>
                        </NavLink>
                        <NavLink to="/admin/configuracion" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Settings size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                                {showDot && pendingCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-3px',
                                        right: isCollapsed ? '-3px' : '13px',
                                        width: '10px',
                                        height: '10px',
                                        background: 'var(--primary-yellow)',
                                        borderRadius: '50%',
                                        border: '1.5px solid #000',
                                        boxShadow: '0 0 8px var(--primary-yellow)'
                                    }}></span>
                                )}
                            </div>
                            <span className="nav-span">Configuración</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {!isCollapsed && (
                <div style={{
                    padding: '15px',
                    marginTop: 'auto',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase' }}>Redes:</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <a href="https://x.com/GoldenShulker" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', display: 'flex' }}>
                            <Twitter size={18} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'} />
                        </a>
                        <a href="https://www.instagram.com/goldenshulker.studios/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', display: 'flex' }}>
                            <Instagram size={18} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'} />
                        </a>
                    </div>
                </div>
            )}

            <div className="sidebar-footer">
                {user ? (
                    <div className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                        <LogIn size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Cerrar Sesión</span>
                    </div>
                ) : (
                    <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <LogIn size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Login</span>
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
