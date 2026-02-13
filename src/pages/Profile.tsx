import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const formatDateProfile = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const MyProjectsSection = ({ token }: { token: string }) => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8001/api/v1/applications/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setApplications(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [token]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Terminado': return '#F44336';
            case 'Inscripciones abiertas': return '#4CAF50';
            case 'En desarrollo': return '#FFC107';
            case 'Próximamente': return '#2196F3';
            default: return 'gray';
        }
    };

    const handleCancel = async (applicationId: number) => {
        if (!confirm('¿Estás seguro de que deseas abandonar este proyecto?')) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8001/api/v1/applications/${applicationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setApplications(prev => prev.filter(app => app.id !== applicationId));
            } else {
                alert('No se pudo cancelar la solicitud');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Cargando proyectos...</p>;

    // Only show ACCEPTED applications
    const acceptedApps = applications.filter(app => app.status === 'Aceptada');

    if (acceptedApps.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ opacity: 0.6 }}>Aún no participas en ningún proyecto oficial.</p>
                <p style={{ opacity: 0.4, fontSize: '0.8rem', marginTop: '10px' }}>Los proyectos aparecerán aquí una vez que tu solicitud sea aceptada.</p>
            </div>
        );
    }

    return (
        <div className="my-projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {acceptedApps.map(app => {
                const project = app.project;
                if (!project) return null;

                // Use project.status from backend directly
                const projectStatus = project.status || 'En desarrollo';
                const statusColor = getStatusColor(projectStatus);

                return (
                    <div key={app.id} className="project-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                            <img src={project.image_url || 'https://via.placeholder.com/400x200'} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#4CAF50', border: '1px solid #4CAF50' }}>
                                Inscrito
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{project.title}</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '10px' }}>{project.tagline}</p>

                            {(project.start_date || project.end_date) && (
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '10px', display: 'flex', gap: '15px' }}>
                                    {project.start_date && <span>Inicio: {formatDateProfile(project.start_date)}</span>}
                                    {project.end_date && <span>Fin: {formatDateProfile(project.end_date)}</span>}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Estado del Proyecto:</span>
                                    <span style={{ color: statusColor, fontWeight: 'bold', fontSize: '0.9rem' }}>{projectStatus}</span>
                                </div>
                                {projectStatus !== 'Terminado' && (
                                    <button
                                        onClick={() => handleCancel(app.id)}
                                        style={{
                                            background: 'rgba(244, 67, 54, 0.1)',
                                            color: '#F44336',
                                            border: '1px solid #F44336',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Abandonar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const StreamerRequestSection = ({ token }: { token: string }) => {
    const [streamerName, setStreamerName] = useState('');
    const [channelUrl, setChannelUrl] = useState('');
    const [status, setStatus] = useState<'None' | 'Pendiente' | 'Aceptada' | 'Rechazada'>('None');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('http://localhost:8001/api/v1/streamer-requests/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Get latest request
                    const latest = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    setStatus(latest.status);
                    if (latest.status === 'Pendiente') {
                        setChannelUrl(latest.channel_url);
                        setStreamerName(latest.streamer_name || '');
                    }
                }
            })
            .catch(err => console.error(err));
    }, [token]);

    const handleSubmit = async () => {
        if (!channelUrl || !streamerName) return;
        setLoading(true);
        setMsg('');

        try {
            const res = await fetch('http://localhost:8001/api/v1/streamer-requests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    channel_url: channelUrl,
                    streamer_name: streamerName
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Error al enviar solicitud');
            }

            setStatus('Pendiente');
            setMsg('Solicitud enviada correctamente.');
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <p style={{ marginBottom: '15px' }}>Si eres creador de contenido, puedes solicitar el rol de Streamer para aparecer en nuestra sección de colaboradores.</p>

            <div className="form-group">
                <label>Nombre de Streamer (Cómo quieres aparecer)</label>
                <input
                    value={streamerName}
                    onChange={e => setStreamerName(e.target.value)}
                    placeholder="Tu nombre de contenido"
                    disabled={status === 'Pendiente' || loading}
                    style={{ width: '100%', padding: '10px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', marginBottom: '15px' }}
                />
            </div>

            <div className="form-group">
                <label>URL de tu Canal (Twitch / YouTube)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        value={channelUrl}
                        onChange={e => setChannelUrl(e.target.value)}
                        placeholder="https://twitch.tv/usuario"
                        disabled={status === 'Pendiente' || loading}
                        style={{ flex: 1, padding: '10px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'Pendiente' || loading || !channelUrl || !streamerName}
                        className="save-btn"
                        style={{ padding: '0 20px', whiteSpace: 'nowrap', opacity: (status === 'Pendiente' || loading) ? 0.5 : 1 }}
                    >
                        {loading ? 'Enviando...' : status === 'Pendiente' ? 'Pendiente' : 'Solicitar Rol'}
                    </button>
                </div>
            </div>

            {msg && <p style={{ marginTop: '10px', color: msg.includes('correctamente') ? '#4CAF50' : '#F44336' }}>{msg}</p>}

            {status === 'Pendiente' && (
                <p style={{ marginTop: '10px', color: 'var(--primary-yellow)', opacity: 0.8 }}>
                    Tu solicitud está en revisión. Te notificaremos cuando sea procesada.
                </p>
            )}

            {status === 'Rechazada' && !msg && (
                <p style={{ marginTop: '10px', color: '#F44336', opacity: 0.8 }}>
                    Tu última solicitud fue rechazada. Podrás intentar nuevamente después del tiempo de espera.
                </p>
            )}
        </div>
    );
};

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

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const fetchUserData = () => {
        fetch('http://localhost:8001/api/v1/me', {
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
            .catch(err => console.error("Error fetching user data:", err));
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserData();
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
            const response = await fetch('http://localhost:8001/api/v1/update', {
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
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`filter-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="profile-content-card">
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
