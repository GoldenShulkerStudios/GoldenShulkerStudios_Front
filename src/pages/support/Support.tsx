import { useState, useEffect } from 'react';
import { LifeBuoy, Send, Clock, CheckCircle, AlertCircle, Paperclip, FileText, X } from 'lucide-react';
import { API_V1_URL, API_BASE_URL } from '../../config';
import TicketChat from '../../components/support/TicketChat';

const Support = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Reporte');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 3;
    const token = localStorage.getItem('token');




    const categories = [
        'Reporte',
        'Error / Bug',
        'Sugerencia',
        'Reclamación',
        'Otro'
    ];

    const handleUpload = (file: File) => {
        if (!token) return;
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_V1_URL}/utils/upload-media`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            setIsUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                if (data.url) setEvidenceUrl(data.url);
            } else {
                alert('Error al subir evidencia');
            }
        };

        xhr.onerror = () => {
            setIsUploading(false);
            alert('Error al conectar con el servidor');
        };

        xhr.send(formData);
    };

    const fetchMyTickets = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_V1_URL}/tickets/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setTickets(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyTickets();
    }, [token]);

    const handleCreateTicket = async (e: any) => {
        e.preventDefault();
        if (!token) {
            alert('Debes iniciar sesión para enviar un ticket.');
            return;
        }
        if (!subject || !description) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_V1_URL}/tickets/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, description, category, evidence_url: evidenceUrl })
            });

            if (res.ok) {
                setSubject('');
                setDescription('');
                setCategory('Reporte');
                setEvidenceUrl('');
                fetchMyTickets();
                alert('Ticket enviado con éxito. En breve un administrador lo revisará.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Abierto': return <Clock size={16} style={{ color: 'var(--primary-yellow)' }} />;
            case 'En Proceso': return <AlertCircle size={16} style={{ color: '#2196F3' }} />;
            case 'Cerrado': return <CheckCircle size={16} style={{ color: '#4CAF50' }} />;
            default: return null;
        }
    };

    const renderEvidencePreview = (url: string) => {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

        if (isImage) return <img src={fullUrl} alt="Evidencia" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />;
        if (isVideo) return <video src={fullUrl} controls style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginTop: '10px' }}>
                <FileText size={20} />
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Documento adjunto</span>
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-yellow)', fontSize: '0.8rem', marginLeft: 'auto' }}>Ver</a>
            </div>
        );
    };

    return (
        <div className="fade-in" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-yellow)' }}>
                    <LifeBuoy size={40} /> CENTRO DE SOPORTE
                </h1>
                <p style={{ opacity: 0.6, fontSize: '1.1rem', marginTop: '10px' }}>
                    ¿Tienes algún problema o sugerencia? Envíanos un ticket y te ayudaremos lo antes posible.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
                {/* Form Section */}
                <section>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '25px', fontSize: '1.4rem' }}>Crear Nuevo Ticket</h3>
                        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="admin-form-group">
                                <label>Asunto</label>
                                <input
                                    placeholder="Ej: Problema con mi rango"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Categoría</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Descripción del Problema</label>
                                <textarea
                                    placeholder="Explica detalladamente lo que sucede..."
                                    style={{ height: '150px' }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Evidence Upload */}
                            <div className="admin-form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Evidencia (Opcional)
                                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>PDF, Word, PNG, JPG, MP4</span>
                                </label>
                                {!evidenceUrl && !isUploading && (
                                    <label className="tool-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                                        <Paperclip size={18} /> Adjuntar Archivo
                                        <input type="file" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} hidden />
                                    </label>
                                )}

                                {isUploading && (
                                    <div className="upload-progress-container" style={{ margin: '0' }}>
                                        <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                                        <span className="upload-progress-text">{uploadProgress}%</span>
                                    </div>
                                )}

                                {evidenceUrl && (
                                    <div style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid var(--primary-yellow)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FileText size={20} style={{ color: 'var(--primary-yellow)' }} />
                                            <span style={{ fontSize: '0.85rem' }}>Archivo listo</span>
                                            <button onClick={() => setEvidenceUrl('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f44336' }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="publish-btn"
                                style={{ width: '100%', marginTop: '10px' }}
                                disabled={loading || isUploading}
                            >
                                <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Ticket'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* My Tickets Section */}
                <section>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {tickets.length === 0 ? (
                            <>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Mis Tickets</h3>
                                <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                    <p style={{ opacity: 0.3 }}>Aún no has enviado ningún ticket.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Show MOST RECENT highlighted ONLY on page 1 */}
                                {currentPage === 1 && (
                                    <>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Mi Ticket Reciente</h3>
                                        <div
                                            onClick={() => setSelectedTicket(tickets[0])}
                                            style={{
                                                background: 'rgba(236, 199, 46, 0.05)',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(236, 199, 46, 0.2)',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>#{tickets[0].id} | {new Date(tickets[0].created_at).toLocaleDateString()}</span>
                                                    <h4 style={{ margin: '5px 0', fontSize: '1.2rem', color: 'var(--primary-yellow)' }}>{tickets[0].subject}</h4>
                                                </div>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    background: 'rgba(0,0,0,0.4)', padding: '4px 12px',
                                                    borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold',
                                                    color: 'var(--primary-yellow)', border: '1px solid rgba(236, 199, 46, 0.2)'
                                                }}>
                                                    {getStatusIcon(tickets[0].status)}
                                                    {tickets[0].status}
                                                </div>
                                                {tickets[0].unread_user && (
                                                    <span style={{
                                                        width: '12px', height: '12px',
                                                        background: 'var(--primary-yellow)',
                                                        borderRadius: '50%',
                                                        boxShadow: '0 0 10px var(--primary-yellow)',
                                                        border: '2px solid #000'
                                                    }}></span>
                                                )}
                                            </div>

                                            <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.6', margin: '15px 0' }}>{tickets[0].description}</p>

                                            {tickets[0].evidence_url && (
                                                <div style={{ marginBottom: '15px' }}>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>Evidencia adjunta:</span>
                                                    {renderEvidencePreview(tickets[0].evidence_url)}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>

                                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Categoría: <strong>{tickets[0].category}</strong></span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--primary-yellow)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    Continuar Conversación <Send size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Paginated History Section */}
                                <div style={{ marginTop: currentPage === 1 ? '30px' : '0' }}>
                                    <h4 style={{
                                        opacity: 0.4, fontSize: '0.9rem',
                                        textTransform: 'uppercase', letterSpacing: '2px',
                                        marginBottom: '20px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        Historial de Tickets {currentPage > 1 ? `(Página ${currentPage})` : ''}
                                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Total: {tickets.length}</span>
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {(() => {
                                            // On page 1: skip the first (already shown as recent)
                                            // On other pages: show normally according to offset
                                            const startIndex = currentPage === 1 ? 1 : (currentPage - 1) * ticketsPerPage;
                                            const endIndex = startIndex + ticketsPerPage;
                                            const paginatedItems = tickets.slice(startIndex, endIndex);

                                            return paginatedItems.map(ticket => (
                                                <div
                                                    key={ticket.id}
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.02)',
                                                        padding: '15px 20px',
                                                        borderRadius: '10px',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <span style={{ fontSize: '0.8rem', opacity: 0.3 }}>#{ticket.id}</span>
                                                            <h5 style={{ margin: 0, fontSize: '1rem', color: ticket.status === 'Cerrado' ? 'rgba(255,255,255,0.5)' : '#fff' }}>{ticket.subject}</h5>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                opacity: 0.6,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                color: ticket.status === 'Abierto' ? 'var(--primary-yellow)' : 'inherit'
                                                            }}>
                                                                {getStatusIcon(ticket.status)} {ticket.status}
                                                                {ticket.unread_user && (
                                                                    <span style={{
                                                                        width: '8px', height: '8px',
                                                                        background: 'var(--primary-yellow)',
                                                                        borderRadius: '50%',
                                                                        boxShadow: '0 0 5px var(--primary-yellow)',
                                                                        marginLeft: '5px'
                                                                    }}></span>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    {/* Pagination Controls */}
                                    {tickets.length > (currentPage === 1 ? ticketsPerPage + 1 : ticketsPerPage) && (
                                        <div style={{
                                            display: 'flex', justifyContent: 'center', gap: '10px',
                                            marginTop: '30px', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                                                    border: 'none', padding: '8px 15px', borderRadius: '6px',
                                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                    opacity: currentPage === 1 ? 0.3 : 1
                                                }}
                                            >
                                                Anterior
                                            </button>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', opacity: 0.6 }}>
                                                Página {currentPage}
                                            </div>

                                            <button
                                                disabled={currentPage * ticketsPerPage >= tickets.length}
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                                                    border: 'none', padding: '8px 15px', borderRadius: '6px',
                                                    cursor: currentPage * ticketsPerPage >= tickets.length ? 'not-allowed' : 'pointer',
                                                    opacity: currentPage * ticketsPerPage >= tickets.length ? 0.3 : 1
                                                }}
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </section>


            </div>

            {/* Chat Modal */}
            {selectedTicket && (
                <TicketChat
                    ticket={selectedTicket}
                    onClose={() => {
                        setSelectedTicket(null);
                        fetchMyTickets();
                    }}
                    onUpdate={fetchMyTickets}
                />
            )}
        </div>
    );
};

export default Support;
