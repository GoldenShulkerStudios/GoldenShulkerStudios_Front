import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Edit2, Trash2, Save, Star, X, Folder, Users } from 'lucide-react';

const ImageUpload = ({ value, onChange, label }: { value: string, onChange: (url: string) => void, label: string }) => {
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8001/api/v1/utils/upload-image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Error subiendo imagen');
            const data = await response.json();
            onChange(`http://localhost:8001${data.url}`);
        } catch (err) {
            alert('Error al subir la imagen');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-form-group">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {value && <img src={value} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                    />
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        padding: '10px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.8rem'
                    }}>
                        {uploading ? 'Subiendo...' : value ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                    </div>
                </div>
                <input type="hidden" name={label.toLowerCase().includes('avatar') ? 'image_url' : (label.toLowerCase().includes('imagen') ? 'image_url' : '')} value={value} />
            </div>
        </div>
    );
};

const AdminInicio = () => {
    const [banners, setBanners] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const token = localStorage.getItem('token');

    const PAGE_ROUTES = [
        { label: 'Inicio', value: '/' },
        { label: 'Proyectos', value: '/proyectos' },
        { label: 'Nosotros', value: '/nosotros' },
        { label: 'Perfil', value: '/perfil' },
        { label: 'Externo', value: 'external' }
    ];

    const [selectedRoute, setSelectedRoute] = useState('');
    const [externalUrl, setExternalUrl] = useState('');

    const fetchBanners = () => {
        fetch('http://localhost:8001/api/v1/banner/')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a: any, b: any) => a.order - b.order);
                setBanners(sorted);
            });
    };

    useEffect(() => { fetchBanners(); }, []);

    useEffect(() => {
        if (isEditing) {
            setTempImageUrl(isEditing.image_url || '');
            const isExternal = isEditing.button_link && !PAGE_ROUTES.find(r => r.value === isEditing.button_link && r.value !== 'external');
            if (isExternal && isEditing.button_link) {
                setSelectedRoute('external');
                setExternalUrl(isEditing.button_link);
            } else {
                setSelectedRoute(isEditing.button_link || '/');
                setExternalUrl('');
            }
        }
    }, [isEditing]);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este banner?')) return;
        await fetch(`http://localhost:8001/api/v1/banner/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchBanners();
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(banners);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for snappy feel
        setBanners(items);

        // Update orders in DB
        const updates = items.map((item, index) => {
            const newOrder = index + 1;
            if (item.order !== newOrder) {
                return fetch(`http://localhost:8001/api/v1/banner/${item.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ ...item, order: newOrder })
                });
            }
            return null;
        }).filter(Boolean);

        if (updates.length > 0) {
            await Promise.all(updates);
            fetchBanners();
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));

        const payload: any = {
            ...data,
            image_url: tempImageUrl,
            button_link: selectedRoute === 'external' ? externalUrl : selectedRoute
        };

        const url = isEditing.id ? `http://localhost:8001/api/v1/banner/${isEditing.id}` : 'http://localhost:8001/api/v1/banner/';
        const method = isEditing.id ? 'PUT' : 'POST';

        // If new, set order to max + 1
        if (!isEditing.id) {
            payload.order = banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1;
        } else {
            payload.order = isEditing.order;
        }

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        setIsEditing(null);
        fetchBanners();
    };

    return (
        <div className="fade-in" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2.5rem' }}>Editar Panel: Inicio (Banners)</h2>
                    <p style={{ opacity: 0.6 }}>Máximo 4 banners permitidos. Arrastra para reordenar.</p>
                </div>
                {banners.length < 4 && (
                    <button className="admin-btn admin-btn-add" onClick={() => setIsEditing({})}>
                        <Plus size={20} /> Nuevo Banner
                    </button>
                )}
            </div>

            <div className="admin-table-container">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="banners">
                        {(provided) => (
                            <table className="admin-table" {...provided.droppableProps} ref={provided.innerRef}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th>Imagen</th>
                                        <th>Título</th>
                                        <th>Ruta Botón</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banners.map((b, idx) => (
                                        <Draggable key={b.id} draggableId={b.id.toString()} index={idx}>
                                            {(provided) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        background: 'rgba(255,255,255,0.02)'
                                                    }}
                                                >
                                                    <td {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
                                                        <GripVertical size={18} style={{ opacity: 0.4 }} />
                                                    </td>
                                                    <td><img src={b.image_url} width="100" style={{ borderRadius: '4px' }} alt="" /></td>
                                                    <td>{b.title}</td>
                                                    <td><code style={{ color: 'var(--primary-yellow)' }}>{b.button_link}</code></td>
                                                    <td>
                                                        <div className="admin-actions-cell">
                                                            <button className="admin-btn admin-btn-edit" onClick={() => setIsEditing(b)}><Edit2 size={16} /></button>
                                                            <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(b.id)}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {isEditing && (
                <div className="modal-overlay" onClick={() => setIsEditing(null)}>
                    <div className="application-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <h3>{isEditing.id ? 'Editar Banner' : 'Nuevo Banner'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <ImageUpload label="Imagen del Banner" value={tempImageUrl} onChange={setTempImageUrl} />
                            </div>
                            <div className="admin-form-group">
                                <label>Título</label>
                                <input name="title" defaultValue={isEditing.title} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Subtítulo</label>
                                <input name="subtitle" defaultValue={isEditing.subtitle} />
                            </div>
                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Descripción</label>
                                <textarea name="description" defaultValue={isEditing.description} />
                            </div>
                            <div className="admin-form-group">
                                <label>Texto Botón</label>
                                <input name="button_text" defaultValue={isEditing.button_text} />
                            </div>
                            <div className="admin-form-group">
                                <label>Redirigir a Panel</label>
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                >
                                    {PAGE_ROUTES.map(route => (
                                        <option key={route.value} value={route.value}>{route.label}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedRoute === 'external' && (
                                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>URL Externa (ej: https://google.com)</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button type="submit" className="save-btn" style={{ flex: 1 }}><Save size={18} /> Guardar</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsEditing(null)} style={{ flex: 1 }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminProyectos = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showParticipants, setShowParticipants] = useState<any>(null);
    const [projectParticipants, setProjectParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const PROJECTS_PER_PAGE = 8;
    const token = localStorage.getItem('token');

    const fetchProjects = () => {
        fetch('http://localhost:8001/api/v1/projects/')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Sort: is_featured first, then start_date descending (newest first)
                    const sorted = data.sort((a: any, b: any) => {
                        if (a.is_featured && !b.is_featured) return -1;
                        if (!a.is_featured && b.is_featured) return 1;

                        // If equal featured status, sort by date
                        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
                        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
                        return dateB - dateA;
                    });
                    setProjects(sorted);
                }
            });
    };

    const fetchParticipants = (projectId: number) => {
        setLoadingParticipants(true);
        fetch(`http://localhost:8001/api/v1/applications/project/${projectId}`, {
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

    useEffect(() => { fetchProjects(); }, []);

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

        await fetch(`http://localhost:8001/api/v1/projects/${project.id}`, {
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
            const res = await fetch(`http://localhost:8001/api/v1/applications/project/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const apps = await res.json();

            if (Array.isArray(apps) && apps.length > 0) {
                if (confirm(`Este proyecto tiene ${apps.length} solicitudes/participantes. ¿Deseas eliminar a todos los participantes para poder eliminar el proyecto?`)) {
                    // Delete all participants
                    await fetch(`http://localhost:8001/api/v1/applications/project/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else {
                    return; // Abort
                }
            }

            // Finally delete the project
            await fetch(`http://localhost:8001/api/v1/projects/${id}`, {
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
            await fetch(`http://localhost:8001/api/v1/applications/${appId}`, {
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

        const url = isEditing.id ? `http://localhost:8001/api/v1/projects/${isEditing.id}` : 'http://localhost:8001/api/v1/projects/';
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

const AdminNosotros = () => {
    const [team, setTeam] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const token = localStorage.getItem('token');

    const SOCIAL_PLATFORMS = [
        { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/tu_usuario' },
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tu_usuario' },
        { key: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/tu_usuario' },
        { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@tu_canal' },
        { key: 'discord', label: 'Discord', placeholder: 'Ej: ewahv1' }
    ];

    const fetchTeam = () => {
        fetch('http://localhost:8001/api/v1/team/')
            .then(res => res.json())
            .then(data => setTeam(data));
    };

    useEffect(() => { fetchTeam(); }, []);

    useEffect(() => {
        if (isEditing) setTempImageUrl(isEditing.image_url || '');
    }, [isEditing]);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar a este miembro del equipo?')) return;
        await fetch(`http://localhost:8001/api/v1/team/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTeam();
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rawData: any = Object.fromEntries(formData);

        // Construct Social Links
        const social_links = SOCIAL_PLATFORMS.map(p => {
            const url = rawData[`social_${p.key}`];
            if (url && url.trim() !== '') {
                return { platform: p.key, url: url.trim() };
            }
            return null;
        }).filter(Boolean);

        const payload = {
            name: rawData.name,
            image_url: tempImageUrl,
            social_links: social_links
        };

        const url = isEditing.id ? `http://localhost:8001/api/v1/team/${isEditing.id}` : 'http://localhost:8001/api/v1/team/';
        const method = isEditing.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Error al guardar miembro');

            setIsEditing(null);
            fetchTeam();
        } catch (err) {
            alert('Error al guardar: ' + err);
        }
    };

    const getSocialValue = (platformKey: string) => {
        if (!isEditing || !isEditing.social_links) return '';
        const link = isEditing.social_links.find((l: any) => l.platform === platformKey);
        return link ? link.url : '';
    };

    return (
        <div className="fade-in" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2.5rem' }}>Miembros del Equipo</h2>
                <button className="admin-btn admin-btn-add" onClick={() => setIsEditing({})}>
                    <Plus size={20} /> Nuevo Miembro
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Nombre</th>
                            <th>Redes</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map(m => (
                            <tr key={m.id}>
                                <td><img src={m.image_url} width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover' }} alt="" /></td>
                                <td>{m.name}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {m.social_links && m.social_links.length > 0 ?
                                            m.social_links.map((l: any, i: number) => (
                                                <span key={i} title={l.platform} style={{
                                                    fontSize: '0.7rem',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {l.platform}
                                                </span>
                                            )) :
                                            <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>Sin redes</span>
                                        }
                                    </div>
                                </td>
                                <td>
                                    <div className="admin-actions-cell">
                                        <button className="admin-btn admin-btn-edit" onClick={() => setIsEditing(m)}><Edit2 size={16} /></button>
                                        <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(m.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditing && (
                <div className="modal-overlay" onClick={() => setIsEditing(null)}>
                    <div className="application-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>{isEditing.id ? 'Editar Miembro' : 'Nuevo Miembro'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Nombre</label>
                                <input name="name" defaultValue={isEditing.name} required />
                            </div>

                            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                                <ImageUpload label="Avatar del Miembro" value={tempImageUrl} onChange={setTempImageUrl} />
                            </div>

                            <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '10px' }}>
                                <h4 style={{ color: 'var(--primary-yellow)', marginBottom: '15px' }}>Redes Sociales</h4>
                            </div>

                            {SOCIAL_PLATFORMS.map(p => (
                                <div key={p.key} className="admin-form-group">
                                    <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{p.label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name={`social_${p.key}`}
                                            defaultValue={getSocialValue(p.key)}
                                            placeholder={p.placeholder}
                                            style={{ paddingLeft: '10px' }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="form-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <button type="submit" className="save-btn" style={{ flex: 1 }}><Save size={18} /> Guardar</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsEditing(null)} style={{ flex: 1 }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminConfig = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [streamerRequests, setStreamerRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch('http://localhost:8001/api/v1/applications/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetch('http://localhost:8001/api/v1/streamer-requests/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
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
            const res = await fetch(`http://localhost:8001/api/v1/applications/${id}`, {
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
            const res = await fetch(`http://localhost:8001/api/v1/applications/${id}`, {
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
            const res = await fetch(`http://localhost:8001/api/v1/streamer-requests/${id}`, {
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

export { AdminInicio, AdminProyectos, AdminNosotros, AdminConfig };
