import { useState } from 'react';
import { Folder } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';
import HistoryModal from '../../components/admin/HistoryModal';
import AdminRequestCard from '../../components/admin/AdminRequestCard';

const AdminConfig = () => {
    const { applications, streamerRequests, loading, updateStatus, deleteItem } = useAdminData();
    const [showAppHistory, setShowAppHistory] = useState(false);
    const [showStreamerHistory, setShowStreamerHistory] = useState(false);

    // Helpers for applications
    const renderAppDetails = (app: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Folder size={12} /> <strong>{app.project?.title}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Nick: <span style={{ color: 'var(--primary-yellow)' }}>{app.user?.minecraft_nick || 'N/A'}</span>
                <span style={{ margin: '0 5px' }}>|</span>
                {app.user?.is_premium ? 'Premium' : 'No Premium'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Discord: {app.user?.discord_id || 'N/A'} <span style={{ margin: '0 5px' }}>|</span> {app.user?.country || 'N/A'}
            </div>
            {app.message && <p style={{ fontStyle: 'italic', fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>"{app.message}"</p>}
        </div>
    );

    const renderAppHistoryDetails = (app: any) => (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{
                width: '45px', height: '45px', borderRadius: '10px',
                background: 'rgba(236, 199, 46, 0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary-yellow)', fontWeight: 'bold', fontSize: '1.2rem'
            }}>
                {app.user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {app.user?.username}
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>ID: #{app.id}</span>
                </div>
                <span style={{ color: 'var(--primary-yellow)', fontSize: '0.9rem', opacity: 0.9 }}>Proyecto: <strong>{app.project?.title}</strong></span>
            </div>
        </div>
    );

    // Helpers for streamers
    const renderStreamerDetails = (req: any) => (
        <div style={{ fontSize: '0.85rem' }}>
            <a href={req.channel_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-yellow)', textDecoration: 'underline' }}>
                {req.channel_url}
            </a>
        </div>
    );

    const renderStreamerHistoryDetails = (req: any) => (
        <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {req.streamer_name}
                <span style={{ fontSize: '0.85rem', opacity: 0.4, fontWeight: 'normal' }}>({req.user?.username})</span>
            </div>
            <div style={{ marginBottom: '4px' }}>
                <a href={req.channel_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-yellow)', fontSize: '0.85rem', textDecoration: 'none', opacity: 0.7 }}>
                    {req.channel_url}
                </a>
            </div>
        </div>
    );

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>PANEL DE CONTROL</h2>
                <p style={{ opacity: 0.6, fontSize: '1rem', letterSpacing: '0.5px' }}>Gestión administrativa de solicitudes y registros.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>

                {/* Section: Project Applications */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(236, 199, 46, 0.2)', paddingBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Inscripciones</h3>
                        <button
                            onClick={() => setShowAppHistory(true)}
                            className="tool-btn"
                            style={{ padding: '6px 16px', fontSize: '0.8rem', color: 'var(--primary-yellow)', border: '1px solid rgba(236,199,46,0.3)' }}
                        >
                            Ver Historial
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        {loading ? <p style={{ opacity: 0.5 }}>Cargando datos...</p> :
                            applications.filter(app => app.status === 'Pendiente').length === 0 ?
                                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                    <p style={{ opacity: 0.3 }}>No hay solicitudes de proyecto pendientes.</p>
                                </div> :
                                applications.filter(app => app.status === 'Pendiente').map(app => (
                                    <AdminRequestCard
                                        key={app.id}
                                        id={app.id}
                                        title={app.user?.username}
                                        subtitle={`minecraft: ${app.user?.minecraft_nick || 'N/A'}`}
                                        status={app.status}
                                        details={renderAppDetails(app)}
                                        onAccept={() => updateStatus('applications', app.id, 'Aceptada')}
                                        onReject={() => updateStatus('applications', app.id, 'Rechazada')}
                                        onDelete={() => deleteItem('applications', app.id)}
                                    />
                                ))
                        }
                    </div>
                </section>

                {/* Section: Streamer Requests */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(236, 199, 46, 0.2)', paddingBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Streamers</h3>
                        <button
                            onClick={() => setShowStreamerHistory(true)}
                            className="tool-btn"
                            style={{ padding: '6px 16px', fontSize: '0.8rem', color: 'var(--primary-yellow)', border: '1px solid rgba(236,199,46,0.3)' }}
                        >
                            Ver Historial
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        {loading ? <p style={{ opacity: 0.5 }}>Cargando datos...</p> :
                            streamerRequests.filter(req => req.status === 'Pendiente').length === 0 ?
                                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                    <p style={{ opacity: 0.3 }}>No hay solicitudes de streamer pendientes.</p>
                                </div> :
                                streamerRequests.filter(req => req.status === 'Pendiente').map(req => (
                                    <AdminRequestCard
                                        key={req.id}
                                        id={req.id}
                                        title={req.streamer_name}
                                        subtitle={`Discord: ${req.user?.username}`}
                                        status={req.status}
                                        details={renderStreamerDetails(req)}
                                        onAccept={() => updateStatus('streamer-requests', req.id, 'Aceptada')}
                                        onReject={() => updateStatus('streamer-requests', req.id, 'Rechazada')}
                                    />
                                ))
                        }
                    </div>
                </section>
            </div>

            {/* Modals */}
            <HistoryModal
                show={showAppHistory}
                onClose={() => setShowAppHistory(false)}
                title="Historial Proyectos"
                subtitle="Registro histórico de todas las inscripciones procesadas"
                icon={Folder}
                items={applications}
                emptyMessage="No hay registros en el historial de inscripciones."
                onRevoke={(id) => updateStatus('applications', id, 'Revocada')}
                renderItemDetails={renderAppHistoryDetails}
                revokeButtonText="Desinscribir"
            />

            <HistoryModal
                show={showStreamerHistory}
                onClose={() => setShowStreamerHistory(false)}
                title="Historial Streamers"
                subtitle="Inscripciones aceptadas y revocadas de creadores"
                icon="★"
                items={streamerRequests}
                emptyMessage="No hay registros en el historial de streamers."
                onRevoke={(id) => updateStatus('streamer-requests', id, 'Revocada')}
                renderItemDetails={renderStreamerHistoryDetails}
                revokeButtonText="Eliminar Rango"
            />
        </div>
    );
};

export default AdminConfig;
