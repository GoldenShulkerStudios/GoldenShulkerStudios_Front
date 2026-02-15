import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { API_V1_URL } from '../config';
import { PanelLeftClose, PanelLeftOpen, Home, FolderOpen, LogIn, Users, UserCircle, Layout, Settings, Instagram, Twitter, Camera, LifeBuoy } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen?: boolean;
    setIsMobileOpen?: (value: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) => {

    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [unreadUserCount, setUnreadUserCount] = useState(0);
    const [showDot, setShowDot] = useState(false);
    const [showProfileDot, setShowProfileDot] = useState(false);



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
                        } else {
                            fetchUnreadUserCount(currentToken);
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

    const fetchUnreadUserCount = (token: string) => {
        fetch(`${API_V1_URL}/utils/unread-chats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (typeof data.unread_count === 'number') {
                    setUnreadUserCount(data.unread_count);
                }
            })
            .catch(err => console.error("Error fetching unread user count:", err));
    };

    const fetchProfileNotifications = async (token: string) => {
        try {
            const [appsRes, streamerRes] = await Promise.all([
                fetch(`${API_V1_URL}/applications/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_V1_URL}/streamer-requests/me`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const appsData = await appsRes.json();
            const streamerData = await streamerRes.json();
            const dismissedNotifs = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');

            let hasNew = false;

            if (Array.isArray(appsData)) {
                const importantApps = appsData.filter(app => app.status === 'Aceptada' || app.status === 'Revocada');
                hasNew = hasNew || importantApps.some(app => !dismissedNotifs.includes(`app-${app.id}-${app.status}`));
            }

            if (Array.isArray(streamerData)) {
                const importantStreamers = streamerData.filter(req => req.status === 'Aceptada' || req.status === 'Revocada');
                hasNew = hasNew || importantStreamers.some(req => !dismissedNotifs.includes(`streamer-${req.id}-${req.status}`));
            }

            setShowProfileDot(hasNew);
        } catch (err) {
            console.error("Error fetching profile notifications:", err);
        }
    };

    useEffect(() => {
        fetchUser();

        // Refresh pending count every 5 minutes if admin
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token) {
                if (user?.role === 'Admin') {
                    fetchPendingCount(token);
                } else {
                    fetchUnreadUserCount(token);
                    fetchProfileNotifications(token);
                }
            }
        }, 1000 * 5); // Check every 5 seconds for real-time feel


        const handleTicketsUpdate = () => {
            const token = localStorage.getItem('token');
            if (token) {
                if (user?.role === 'Admin') fetchPendingCount(token);
                else fetchUnreadUserCount(token);
            }
        };

        window.addEventListener('authChange', fetchUser);
        window.addEventListener('storage', fetchUser);
        window.addEventListener('ticketsUpdated', handleTicketsUpdate);
        window.addEventListener('profileUpdated', () => {
            const token = localStorage.getItem('token');
            if (token) fetchProfileNotifications(token);
        });

        return () => {
            clearInterval(interval);
            window.removeEventListener('authChange', fetchUser);
            window.removeEventListener('storage', fetchUser);
            window.removeEventListener('ticketsUpdated', handleTicketsUpdate);
            window.removeEventListener('profileUpdated', fetchUser);
        };

    }, [user?.role, location.pathname]);


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
        <>
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen?.(false)}
                />
            )}
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <button
                    className="toggle-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>

                <Link to="/" className="logo-container" onClick={() => setIsMobileOpen?.(false)}>
                    <img src="/logo.png" alt="Logo" />
                </Link>


                {user && (
                    <div className="sidebar-user-header">
                        <NavLink to="/perfil" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <UserCircle size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                                {showProfileDot && (
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
                            <span className="nav-span">Mi Perfil</span>
                        </NavLink>
                        <div className="sidebar-separator"></div>
                    </div>

                )}

                <nav style={{ flex: 1 }}>
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                        <Home size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Inicio</span>
                    </NavLink>
                    <NavLink to="/proyectos" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                        <FolderOpen size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Proyectos</span>
                    </NavLink>
                    <NavLink to="/nosotros" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                        <Users size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Nosotros</span>
                    </NavLink>

                    <NavLink to="/comunidad" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                        <Camera size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                        <span className="nav-span">Momentos</span>
                    </NavLink>

                    <NavLink to="/soporte" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <LifeBuoy size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                            {user?.role === 'Usuario' && unreadUserCount > 0 && (
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
                        <span className="nav-span">Soporte</span>
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
                                display: (isCollapsed && !isMobileOpen) ? 'none' : 'block'
                            }}>
                                Panel Admin
                            </div>
                            <NavLink to="/admin/paneles" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                                <Layout size={22} style={{ marginRight: isCollapsed ? '0' : '15px' }} />
                                <span className="nav-span">Editar Paneles</span>
                            </NavLink>

                            <NavLink to="/admin/solicitudes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
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
                                <span className="nav-span">Solicitudes</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                {(!isCollapsed || isMobileOpen) && (
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
                        <div className="nav-link" onClick={() => { handleLogout(); setIsMobileOpen?.(false); }} style={{ cursor: 'pointer' }}>
                            <LogIn size={22} style={{ marginRight: (isCollapsed && !isMobileOpen) ? '0' : '15px' }} />
                            <span className="nav-span">Cerrar Sesión</span>
                        </div>
                    ) : (
                        <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setIsMobileOpen?.(false)}>
                            <LogIn size={22} style={{ marginRight: (isCollapsed && !isMobileOpen) ? '0' : '15px' }} />
                            <span className="nav-span">Login</span>
                        </NavLink>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
