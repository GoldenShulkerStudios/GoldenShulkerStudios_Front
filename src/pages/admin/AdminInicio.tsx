import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Edit2, Trash2, Save } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import { API_BASE_URL, API_V1_URL } from '../../config';

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
        fetch(`${API_V1_URL}/banner/`)
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
        await fetch(`${API_V1_URL}/banner/${id}`, {
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
                return fetch(`${API_V1_URL}/banner/${item.id}`, {
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

        const url = isEditing.id ? `${API_V1_URL}/banner/${isEditing.id}` : `${API_V1_URL}/banner/`;
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
            <div className="admin-header-actions">
                {banners.length < 4 && (
                    <button className="admin-btn admin-btn-add" onClick={() => setIsEditing({})}>
                        <Plus size={20} /> Nuevo Banner
                    </button>
                )}
            </div>
            <div style={{ display: 'none' }}>
                <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2.5rem' }}>Editar Panel: Inicio (Banners)</h2>
                <p style={{ opacity: 0.6 }}>Máximo 4 banners permitidos. Arrastra para reordenar.</p>
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
                                                    <td><img src={b.image_url?.startsWith('http') ? b.image_url : `${API_BASE_URL}${b.image_url}`} width="100" style={{ borderRadius: '4px' }} alt="" /></td>
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

export default AdminInicio;
