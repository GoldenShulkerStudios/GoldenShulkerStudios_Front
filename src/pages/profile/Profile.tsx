import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyProjectsSection from './MyProjectsSection';
import StreamerRequestSection from './StreamerRequestSection';
import { API_V1_URL } from '../../config';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('Mis datos');
    const [user, setUser] = useState<{ username: string, email: string, role: string, minecraft_nick: string, is_premium: boolean, country: string, discord_id: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    // New fields state
    const [minecraftNick, setMinecraftNick] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [country, setCountry] = useState('');
    const [discordId, setDiscordId] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const fetchUserData = () => {
        fetch(`${API_V1_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    setUser(data);
                    setUsername(data.username);
                    setMinecraftNick(data.minecraft_nick || '');
                    setIsPremium(data.is_premium || false);
                    setCountry(data.country || '');
                    setDiscordId(data.discord_id || '');
                }
            })
    };

    const fetchNotifications = async () => {
        try {
            const [appsRes, streamerRes] = await Promise.all([
                fetch(`${API_V1_URL}/applications/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_V1_URL}/streamer-requests/me`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const appsData = await appsRes.json();
            const streamerData = await streamerRes.json();

            interface Notification {
                id: string;
                type: string;
                text: string;
                targetTab: string;
            }

            const newNotifications: Notification[] = [];
            const dismissedNotifs = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');

            if (Array.isArray(appsData)) {
                const importantApps = appsData.filter(app => app.status === 'Aceptada' || app.status === 'Revocada');
                importantApps.forEach(app => {
                    const id = `app-${app.id}-${app.status}`;
                    if (!dismissedNotifs.includes(id)) {
                        const isRevoked = app.status === 'Revocada';
                        newNotifications.push({
                            id,
                            type: 'project',
                            text: isRevoked
                                ? `Tu inscripción para "${app.project?.title}" ha sido revocada. Habla con el staff para info.`
                                : `¡Tu solicitud para "${app.project?.title}" ha sido aceptada!`,
                            targetTab: 'Proyectos participados'
                        });
                    }
                });
            }

            if (Array.isArray(streamerData)) {
                const importantStreamers = streamerData.filter(req => req.status === 'Aceptada' || req.status === 'Revocada');
                importantStreamers.forEach(req => {
                    const id = `streamer-${req.id}-${req.status}`;
                    if (!dismissedNotifs.includes(id)) {
                        const isRevoked = req.status === 'Revocada';
                        newNotifications.push({
                            id,
                            type: 'streamer',
                            text: isRevoked
                                ? `Tu rango de Streamer ha sido revocado. Habla con el staff para info.`
                                : `¡Tu solicitud de Streamer ha sido aceptada!`,
                            targetTab: 'Configuración / Conexiones'
                        });
                    }
                });
            }

            setNotifications(newNotifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    const dismissNotification = (id: string) => {
        const dismissedNotifs = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        if (!dismissedNotifs.includes(id)) {
            dismissedNotifs.push(id);
            localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifs));
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserData();
        fetchNotifications();
    }, [token, navigate]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== passwordRepeat) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_V1_URL}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    ...(password ? { password, password_repeat: passwordRepeat } : {}),
                    minecraft_nick: minecraftNick,
                    is_premium: isPremium,
                    country: country,
                    discord_id: discordId
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Error al actualizar datos');
            }

            setSuccess('Datos actualizados correctamente');
            setIsEditing(false);
            setPassword('');
            setPasswordRepeat('');
            fetchUserData();
            // Optional: for top navbar to update immediately, we might need a global state or event
            window.dispatchEvent(new Event('storage'));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['Mis datos', 'Proyectos participados', 'Configuración / Conexiones'];

    if (!user) return <div className="fade-in" style={{ padding: '40px' }}>Cargando perfil...</div>;

    return (
        <div className="profile-container fade-in">
            <header className="profile-header">
                <h1> PANEL DE {user.role.toUpperCase()}</h1>
                <p>Gestiona tu información y proyectos en Golden Shulker Studios.</p>
            </header>

            <div className="filters-wrapper">
                {tabs.map(tab => {
                    const hasNotif = notifications.some(n => n.targetTab === tab);
                    return (
                        <button
                            key={tab}
                            className={`filter-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab);
                                // Dismiss all notifications for this tab when clicked
                                notifications.filter(n => n.targetTab === tab).forEach(n => dismissNotification(n.id));
                            }}
                            style={{ position: 'relative' }}
                        >
                            {tab}
                            {hasNotif && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    width: '10px',
                                    height: '10px',
                                    background: 'var(--primary-yellow)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px var(--primary-yellow)'
                                }}></span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="profile-content-card">
                {notifications.length > 0 && activeTab === 'Mis datos' && (
                    <div className="notifications-container" style={{ marginBottom: '20px' }}>
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => {
                                    setActiveTab(n.targetTab);
                                    dismissNotification(n.id);
                                }}
                                style={{
                                    background: 'rgba(236, 199, 46, 0.1)',
                                    border: '1px solid var(--primary-yellow)',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    animation: 'pulse 2s infinite'
                                }}
                            >
                                <span style={{ color: 'var(--primary-yellow)', fontWeight: 'bold' }}>{n.text}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Ver más →</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dismissNotification(n.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            opacity: 0.5,
                                            padding: '5px'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {activeTab === 'Mis datos' && (
                    <div className="fade-in">
                        {!isEditing ? (
                            <div className="data-grid">
                                <div className="data-item">
                                    <span className="data-label">Nombre de Usuario</span>
                                    <span className="data-value">{user.username}</span>
                                </div>
                                <div className="data-item">
                                    <span className="data-label">Correo Electrónico</span>
                                    <span className="data-value">{user.email}</span>
                                </div>
                                <div className="data-item">
                                    <span className="data-label">Rango / Rol</span>
                                    <span className="data-value" style={{ color: 'var(--primary-yellow)', fontWeight: 'bold' }}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="data-item">
                                    <span className="data-label">Nick de Minecraft</span>
                                    <span className="data-value">{user.minecraft_nick || 'No especificado'}</span>
                                </div>
                                <div className="data-item">
                                    <span className="data-label">Cuenta Premium</span>
                                    <span className="data-value" style={{ color: 'white' }}>
                                        {user.is_premium ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className="data-item">
                                    <span className="data-label">País</span>
                                    <span className="data-value">{user.country || 'No especificado'}</span>
                                </div>
                                <div className="data-item">
                                    <span className="data-label">Discord ID</span>
                                    <span className="data-value">{user.discord_id || 'No especificado'}</span>
                                </div>
                                <div className="data-item" style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                                    <button className="save-btn" onClick={() => setIsEditing(true)} style={{ width: 'fit-content', padding: '12px 60px' }}>
                                        Editar Datos
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form className="edit-form fade-in" onSubmit={handleUpdate}>
                                <div className="form-group">
                                    <label>Nuevo Nombre de Usuario</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nueva Contraseña (opcional)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Dejar en blanco para no cambiar"
                                    />
                                </div>
                                {password && (
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Repetir Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwordRepeat}
                                            onChange={(e) => setPasswordRepeat(e.target.value)}
                                            required
                                            style={{ maxWidth: '48.5%' }}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Nick de Minecraft</label>
                                    <input
                                        type="text"
                                        value={minecraftNick}
                                        onChange={(e) => setMinecraftNick(e.target.value)}
                                        placeholder="Steve"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>¿Es Premium?</label>
                                    <select
                                        value={isPremium ? 'true' : 'false'}
                                        onChange={(e) => setIsPremium(e.target.value === 'true')}
                                        style={{ padding: '11px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', width: '100%' }}
                                    >
                                        <option value="false">No Premium</option>
                                        <option value="true">Premium</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>País</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="Tu país"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ID de Discord</label>
                                    <input
                                        type="text"
                                        value={discordId}
                                        onChange={(e) => setDiscordId(e.target.value)}
                                        placeholder="usuario#0000"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn" disabled={loading}>
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === 'Proyectos participados' && (
                    <div className="fade-in">
                        <MyProjectsSection token={token || ''} />
                    </div>
                )}

                {activeTab === 'Configuración / Conexiones' && (
                    <div className="fade-in" style={{ padding: '20px' }}>
                        <h3 style={{ color: 'var(--primary-yellow)', marginBottom: '20px' }}>Conexiones</h3>

                        {user.role === 'Streamer' ? (
                            <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #4CAF50' }}>
                                <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>¡Ya eres Streamer oficial de Golden Shulker Studios!</p>
                            </div>
                        ) : (
                            <StreamerRequestSection token={token || ''} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
