import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Star, X, Users } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import { API_V1_URL } from '../../config';
import { validateAdminAction } from '../../validations/adminValidation';

const AdminProyectos = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showParticipants, setShowParticipants] = useState<any>(null);
    const [projectParticipants, setProjectParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const PROJECTS_PER_PAGE = 8;
    const [user, setUser] = useState<any>(null);
    const token = localStorage.getItem('token');

    const fetchProjects = () => {
        fetch(`${API_V1_URL}/projects/`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Sort: is_featured first, then start_date descending (newest first), then id descending
                    const sorted = data.sort((a: any, b: any) => {
                        if (a.is_featured && !b.is_featured) return -1;
                        if (!a.is_featured && b.is_featured) return 1;

                        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
                        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
                        if (dateB !== dateA) return dateB - dateA;
                        return b.id - a.id;
                    });
                    setProjects(sorted);
                }
            });
    };

    const fetchParticipants = (projectId: number) => {
        setLoadingParticipants(true);
        fetch(`${API_V1_URL}/applications/project/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Only show accepted participants
                    setProjectParticipants(data.filter(app => app.status === 'Aceptada'));
                }
            })
            .finally(() => setLoadingParticipants(false));
    };

    useEffect(() => {
        if (token) {
            fetch(`${API_V1_URL}/me`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => setUser(data));
        }
        fetchProjects();
    }, [token]);

    // Pagination Logic
    const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    const paginatedProjects = projects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

    useEffect(() => {
        if (isEditing) setTempImageUrl(isEditing.image_url || '');
    }, [isEditing]);

    const handleToggleFeatured = async (project: any) => {
        const payload = { ...project, is_featured: !project.is_featured };
        if (typeof payload.adds === 'string') {
            try { payload.adds = JSON.parse(payload.adds); }
            catch { payload.adds = payload.adds.split(',').map((s: any) => s.trim()); }
        }

        await fetch(`${API_V1_URL}/projects/${project.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        fetchProjects();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este proyecto?')) return;

        try {
            // Check if there are applications
            const res = await fetch(`${API_V1_URL}/applications/project/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const apps = await res.json();

            if (Array.isArray(apps) && apps.length > 0) {
                if (confirm(`Este proyecto tiene ${apps.length} solicitudes/participantes. ¿Deseas eliminar a todos los participantes para poder eliminar el proyecto?`)) {
                    // Delete all participants
                    await fetch(`${API_V1_URL}/applications/project/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else {
                    return; // Abort
                }
            }

            // Finally delete the project
            await fetch(`${API_V1_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProjects();
        } catch (err) {
            console.error("Error deleting project:", err);
            alert("Error al eliminar el proyecto.");
        }
    };

    const handleDeleteParticipant = async (appId: number, projectId: number) => {
        if (!confirm('¿Seguro que quieres quitar a este participante de este proyecto?')) return;

        try {
            await fetch(`${API_V1_URL}/applications/${appId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchParticipants(projectId);
        } catch (err) {
            console.error("Error deleting participant:", err);
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        if (!validateAdminAction(user, token)) return;
        const formData = new FormData(e.target);
        const rawData: any = Object.fromEntries(formData);

        const payload = {
            title: rawData.title,
            tagline: rawData.tagline,
            category: rawData.category,
            image_url: tempImageUrl,
            client: rawData.client,
            duration: rawData.duration,
            adds: rawData.adds.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''),
            description: rawData.description,
            status: rawData.status,
            is_featured: isEditing.is_featured || false,
            start_date: rawData.start_date || null,
            end_date: rawData.end_date || null
        };

        const url = isEditing.id ? `${API_V1_URL}/projects/${isEditing.id}` : `${API_V1_URL}/projects/`;
        const method = isEditing.id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error al guardar proyecto');
            setIsEditing(null);
            fetchProjects();
        } catch (err) {
            alert('Error al guardar el proyecto.');
        }
    };

    return (
        <div className="fade-in" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2.5rem' }}>Editar Panel: Proyectos</h2>
                <button className="admin-btn admin-btn-add" onClick={() => setIsEditing({})}>
                    <Plus size={20} /> Nuevo Proyecto
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>Destacado</th>
                            <th>Título</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                            <th>Cliente</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProjects.map(p => (
                            <tr key={p.id}>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleToggleFeatured(p)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: p.is_featured ? 'var(--primary-yellow)' : 'rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <Star size={20} fill={p.is_featured ? 'currentColor' : 'none'} />
                                    </button>
                                </td>
                                <td>{p.title}</td>
                                <td>{p.category}</td>
                                <td><span className={`status-badge status-${p.status.toLowerCase().replace(/ /g, '-')}`}>{p.status}</span></td>
                                <td>{p.client}</td>
                                <td>
                                    <div className="admin-actions-cell">
                                        <button className="admin-btn" style={{ background: 'var(--primary-yellow)', color: '#000' }} title="Ver Participantes" onClick={() => { setShowParticipants(p); fetchParticipants(p.id); }}><Users size={16} /></button>
                                        <button className="admin-btn admin-btn-edit" onClick={() => setIsEditing(p)}><Edit2 size={16} /></button>
                                        <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="admin-btn"
                            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
                        >
                            Anterior
                        </button>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        background: currentPage === page ? 'var(--primary-yellow)' : 'rgba(255,255,255,0.05)',
                                        color: currentPage === page ? '#000' : '#fff',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="admin-btn"
                            style={{ opacity: currentPage === totalPages ? 0.3 : 1 }}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="modal-overlay" onClick={() => setIsEditing(null)}>
                    <div className="application-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>{isEditing.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Título</label>
                                <input name="title" defaultValue={isEditing.title} required />
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Subtítulo</label>
                                <input name="tagline" defaultValue={isEditing.tagline} placeholder="Frase corta descriptiva del proyecto" />
                            </div>

                            <div className="admin-form-group">
                                <label>Categoría</label>
                                <select name="category" defaultValue={isEditing.category || 'Propios'}>
                                    <option>Propios</option>
                                    <option>Streamers</option>
                                    <option>Privados</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label>Estado</label>
                                <select name="status" defaultValue={isEditing.status || 'En desarrollo'}>
                                    <option>En desarrollo</option>
                                    <option>Inscripciones abiertas</option>
                                    <option>Terminado</option>
                                    <option>Próximamente</option>
                                </select>
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <ImageUpload label="Imagen del Proyecto" value={tempImageUrl} onChange={setTempImageUrl} />
                            </div>

                            <div className="admin-form-group">
                                <label>Cliente</label>
                                <input name="client" defaultValue={isEditing.client} />
                            </div>
                            <div className="admin-form-group">
                                <label>Duración</label>
                                <input name="duration" defaultValue={isEditing.duration} />
                            </div>

                            <div className="admin-form-group">
                                <label>Fecha Inicio (Opcional)</label>
                                <input
                                    name="start_date"
                                    type="date"
                                    defaultValue={isEditing.start_date}
                                    style={{ colorScheme: 'dark' }}
                                    className="yellow-calendar"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Fecha Fin (Opcional)</label>
                                <input
                                    name="end_date"
                                    type="date"
                                    defaultValue={isEditing.end_date}
                                    style={{ colorScheme: 'dark' }}
                                    className="yellow-calendar"
                                />
                                <style>{`
                                    .yellow-calendar::-webkit-calendar-picker-indicator {
                                        filter: invert(82%) sepia(35%) saturate(1216%) hue-rotate(358deg) brightness(101%) contrast(105%);
                                        cursor: pointer;
                                    }
                                `}</style>
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Adds (separados por coma)</label>
                                <input name="adds" defaultValue={isEditing.adds ? (typeof isEditing.adds === 'string' ? JSON.parse(isEditing.adds).join(', ') : isEditing.adds) : ''} placeholder="Datapacks, Resourcepacks, Plugins" />
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Descripción</label>
                                <textarea name="description" defaultValue={isEditing.description} rows={3} />
                            </div>

                            <div className="form-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '15px' }}>
                                <button type="submit" className="save-btn" style={{ flex: 1 }}><Save size={18} /> Guardar</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsEditing(null)} style={{ flex: 1 }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showParticipants && (
                <div className="modal-overlay" onClick={() => setShowParticipants(null)}>
                    <div className="application-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0 }}>Participantes: {showParticipants.title}</h3>
                            <button onClick={() => setShowParticipants(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {loadingParticipants ? (
                                <p>Cargando participantes...</p>
                            ) : projectParticipants.length === 0 ? (
                                <p style={{ opacity: 0.5, textAlign: 'center', padding: '20px' }}>No hay participantes aceptados en este proyecto.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {projectParticipants.map(participant => (
                                        <div key={participant.id} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '15px'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--primary-yellow)' }}>
                                                    {participant.user?.minecraft_nick || 'Sin Nick'}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                    {participant.user?.username} | {participant.user?.discord_id || 'Sin Discord'}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'right' }}>
                                                <div>{participant.user?.country || 'Sin País'}</div>
                                                <div style={{ color: participant.user?.is_premium ? '#4CAF50' : '#aaa' }}>
                                                    {participant.user?.is_premium ? 'Premium' : 'No Premium'}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteParticipant(participant.id, showParticipants.id)}
                                                className="admin-btn admin-btn-delete"
                                                style={{ padding: '8px' }}
                                                title="Eliminar participante"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button className="admin-btn" onClick={() => setShowParticipants(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProyectos;
