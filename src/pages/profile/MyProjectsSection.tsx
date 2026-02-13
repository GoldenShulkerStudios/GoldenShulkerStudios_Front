import { useState, useEffect } from 'react';
import { formatDateProfile } from './utils';

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

export default MyProjectsSection;
