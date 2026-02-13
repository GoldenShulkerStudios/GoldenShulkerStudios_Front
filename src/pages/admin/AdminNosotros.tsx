import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import ImageUpload from './components/ImageUpload';

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

export default AdminNosotros;
