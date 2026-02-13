import { useState, useEffect } from 'react';
import { Folder, X } from 'lucide-react';
import { API_V1_URL } from '../../config';

const AdminConfig = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [streamerRequests, setStreamerRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch(`${API_V1_URL}/applications/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetch(`${API_V1_URL}/streamer-requests/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
        ])
            .then(([appData, streamerData]) => {
                if (Array.isArray(appData)) {
                    // Sort descending by created_at
                    const sorted = appData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setApplications(sorted);
                }
                if (Array.isArray(streamerData)) {
                    const sorted = streamerData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setStreamerRequests(sorted);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleAppStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`${API_V1_URL}/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAppDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta inscripción del proyecto?')) return;
        try {
            const res = await fetch(`${API_V1_URL}/applications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStreamerStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`${API_V1_URL}/streamer-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2rem', marginBottom: '5px' }}>Configuración</h2>
            <p style={{ marginBottom: '20px', opacity: 0.7, fontSize: '0.9rem' }}>Gestión de solicitudes e inscripciones (Ordenadas por más recientes).</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                {/* Column 1: Project Applications */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Inscripciones a Proyectos</h3>
                    <div className="applications-list" style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))' }}>
                        {loading ? <p>Cargando...</p> :
                            applications.length === 0 ? <p style={{ opacity: 0.5 }}>No hay solicitudes.</p> :
                                applications.map(app => (
                                    <div key={app.id} style={{
                                        padding: '10px',
                                        borderRadius: '6px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', flexDirection: 'column', gap: '5px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-yellow)' }}>{app.user?.username}</span>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <span className={`status-badge status-${app.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{app.status}</span>
                                                <button onClick={() => handleAppDelete(app.id)} style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', padding: 0 }} title="Eliminar/Cancelar">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px', margin: '5px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Folder size={12} /> <strong>{app.project?.title}</strong></div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                Nick: <span style={{ color: 'var(--primary-yellow)' }}>{app.user?.minecraft_nick || 'N/A'}</span>
                                                <span style={{ margin: '0 5px' }}>|</span>
                                                {app.user?.is_premium ? 'Premium' : 'No Premium'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                Discord: {app.user?.discord_id || 'N/A'} <span style={{ margin: '0 5px' }}>|</span> {app.user?.country || 'N/A'}
                                            </div>
                                        </div>
                                        {app.message && <p style={{ fontStyle: 'italic', fontSize: '0.8rem', opacity: 0.6, margin: '2px 0' }}>"{app.message.substring(0, 50)}{app.message.length > 50 ? '...' : ''}"</p>}

                                        {app.status === 'Pendiente' && (
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                <button onClick={() => handleAppStatus(app.id, 'Aceptada')} className="admin-btn" style={{ background: '#4CAF50', padding: '2px 8px', fontSize: '0.7rem', flex: 1 }}>
                                                    Aceptar
                                                </button>
                                                <button onClick={() => handleAppStatus(app.id, 'Rechazada')} className="admin-btn" style={{ background: '#F44336', padding: '2px 8px', fontSize: '0.7rem', flex: 1 }}>
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                        }
                    </div>
                </div>

                {/* Column 2: Streamer Requests */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Solicitudes de Streamer</h3>
                    <div className="applications-list" style={{ display: 'grid', gap: '10px' }}>
                        {loading ? <p>Cargando...</p> :
                            streamerRequests.length === 0 ? <p style={{ opacity: 0.5 }}>No hay solicitudes.</p> :
                                streamerRequests.map(req => (
                                    <div key={req.id} style={{
                                        padding: '10px',
                                        borderRadius: '6px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', flexDirection: 'column', gap: '5px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-yellow)' }}>
                                                {req.streamer_name} ({req.user?.username})
                                            </span>
                                            <span className={`status-badge status-${req.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{req.status}</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            <a href={req.channel_url} target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', textDecoration: 'underline' }}>{req.channel_url}</a>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'right' }}>
                                            {(() => { const d = new Date(req.created_at); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; })()}
                                        </div>

                                        {req.status === 'Pendiente' && (
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                <button onClick={() => handleStreamerStatus(req.id, 'Aceptada')} className="admin-btn" style={{ background: '#4CAF50', padding: '2px 8px', fontSize: '0.7rem', flex: 1 }}>
                                                    Aceptar
                                                </button>
                                                <button onClick={() => handleStreamerStatus(req.id, 'Rechazada')} className="admin-btn" style={{ background: '#F44336', padding: '2px 8px', fontSize: '0.7rem', flex: 1 }}>
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminConfig;
