import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Send } from 'lucide-react';

export interface Project {
    id: number;
    title: string;
    subtitle: string;
    category: string;
    image: string;
    cliente: string;
    duracion: string;
    adds: string[];
    description: string;
    status: string;
    is_featured: boolean;
    start_date?: string;
    end_date?: string;
}

export interface UpcomingProject {
    id: number;
    title: string;
    image?: string;
    isComingSoon: boolean;
}

const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const ProjectsSection = () => {
    const [filter, setFilter] = useState('All');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isApplying, setIsApplying] = useState(false);
    const [message, setMessage] = useState('');
    const [applyingLoading, setApplyingLoading] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const reelRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(6);
    const [user, setUser] = useState<any>(null);
    const [myApplications, setMyApplications] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:8001/api/v1/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setUser(data))
                .catch(err => console.error(err));

            // Fetch user's existing applications to prevent duplicates
            fetch('http://localhost:8001/api/v1/applications/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setMyApplications(data);
                })
                .catch(err => console.error(err));
        }

        fetch('http://localhost:8001/api/v1/projects/')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProjects(data.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        subtitle: p.tagline,
                        category: p.category,
                        image: p.image_url,
                        cliente: p.client,
                        duracion: p.duration,
                        adds: Array.isArray(p.adds) ? p.adds : (typeof p.adds === 'string' ? JSON.parse(p.adds) : []),
                        description: p.description,
                        status: p.status,
                        is_featured: p.is_featured,
                        start_date: p.start_date,
                        end_date: p.end_date
                    })));
                }
            })
            .catch(err => console.error(err));
    }, []);

    const categories = ['All', 'Propios', 'Streamers', 'Privados'];

    const filteredProjects = filter === 'All'
        ? projects.filter(p => p.status !== 'Próximamente')
        : projects.filter(p => p.category === filter && p.status !== 'Próximamente');

    // Sort by start_date descending (newest first)
    filteredProjects.sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    // Featured project is now based on is_featured property
    const currentProject = projects.find(p => p.is_featured);

    const scrollReel = (direction: 'left' | 'right') => {
        if (reelRef.current) {
            const scrollAmount = 300;
            reelRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Check if user already applied to a specific project
    const hasAppliedTo = (projectId: number) => {
        return myApplications.some(app => app.project_id === projectId);
    };

    const handleApply = async () => {
        if (!selectedProject) return;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión para inscribirte');
            return;
        }

        if (hasAppliedTo(selectedProject.id)) {
            alert('Ya has enviado una solicitud para este proyecto.');
            return;
        }

        setApplyingLoading(true);
        try {
            const response = await fetch('http://localhost:8001/api/v1/applications/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    project_id: selectedProject.id,
                    message: message
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al enviar la solicitud');
            }

            const newApp = await response.json();
            // Add to local list so button disables immediately
            setMyApplications(prev => [...prev, newApp]);

            setApplySuccess(true);
            setTimeout(() => {
                setIsApplying(false);
                setApplySuccess(false);
                setMessage('');
            }, 3000);
        } catch (err: any) {
            alert(err.message || 'Error al enviar la solicitud');
        } finally {
            setApplyingLoading(false);
        }
    };

    const getStatusClass = (status: string) => {
        return `status-badge status-${status.toLowerCase().replace(/ /g, '-')}`;
    };

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h2>Catálogo de Proyectos</h2>
                <p>Explora lo que estamos construyendo y lo que ya hemos logrado.</p>
            </div>

            {/* Banner de Proyecto Actual */}
            {currentProject && (
                <div
                    className="current-project-banner"
                    onClick={() => setSelectedProject(currentProject)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="current-project-info">
                        <span className="current-label">Proyecto Actual</span>
                        <h2 className="current-title">{currentProject.title}</h2>
                        <p className="current-subtitle">{currentProject.subtitle}</p>
                        <div className="detail-meta" style={{ marginBottom: 15 }}>
                            <div className="meta-item">
                                <span className="meta-label" style={{ color: '#000' }}>Estado:</span>
                                <span className={getStatusClass(currentProject.status)}>{currentProject.status}</span>
                            </div>
                        </div>
                        <div className="detail-meta" style={{ marginBottom: 0 }}>
                            <div className="meta-item">
                                <span className="meta-label" style={{ color: '#000' }}>Cliente:</span>
                                <span className="meta-value" style={{ color: '#000', fontWeight: 600 }}>{currentProject.cliente}</span>
                            </div>
                        </div>
                    </div>
                    <div className="current-image-wrapper">
                        <img src={currentProject.image} alt="Featured" className="current-image" />
                    </div>
                </div>
            )}

            <div className="projects-header" style={{ textAlign: 'left', marginTop: '60px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.8rem' }}>Todos nuestros proyectos</h2>
                <p style={{ color: 'var(--primary-yellow)' }}>Nuestra trayectoria y grandes hitos realizados</p>
            </div>

            <div className="filters-wrapper">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => {
                            setFilter(cat);
                            setVisibleCount(6); // Reset visible count on filter change
                            setSelectedProject(null);
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="projects-grid">
                {selectedProject && (
                    <div className="project-detail-panel fade-in">
                        <div className="detail-image-wrapper">
                            <img src={selectedProject.image} alt={selectedProject.title} className="detail-image" />
                        </div>
                        <div className="detail-content">
                            <button
                                className="close-detail"
                                onClick={() => setSelectedProject(null)}
                            >
                                <X size={24} />
                            </button>
                            <h3 className="detail-title">{selectedProject.title}</h3>

                            <div className="detail-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Estado</span>
                                    <span className={getStatusClass(selectedProject.status)}>{selectedProject.status}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Cliente</span>
                                    <span className="meta-value">{selectedProject.cliente}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Duración</span>
                                    <span className="meta-value">{selectedProject.duracion}</span>
                                </div>
                            </div>

                            {(selectedProject.start_date || selectedProject.end_date) && (
                                <div className="detail-meta" style={{ marginTop: '-10px' }}>
                                    {selectedProject.start_date && (
                                        <div className="meta-item">
                                            <span className="meta-label">Inicio</span>
                                            <span className="meta-value">{formatDate(selectedProject.start_date)}</span>
                                        </div>
                                    )}
                                    {selectedProject.end_date && (
                                        <div className="meta-item">
                                            <span className="meta-label">Fin</span>
                                            <span className="meta-value">{formatDate(selectedProject.end_date)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedProject.adds && selectedProject.adds.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {(selectedProject.adds as any).map((add: string, i: number) => (
                                        <span key={i} style={{
                                            background: 'rgba(255,215,0,0.1)',
                                            color: 'var(--primary-yellow)',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            border: '1px solid rgba(255,215,0,0.3)'
                                        }}>
                                            {add}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="detail-description">{selectedProject.description}</p>

                            {selectedProject.status === 'Inscripciones abiertas' && !hasAppliedTo(selectedProject.id) && (
                                <button className="apply-btn" onClick={() => setIsApplying(true)}>
                                    Inscribirse al Proyecto
                                </button>
                            )}
                            {selectedProject.status === 'Inscripciones abiertas' && hasAppliedTo(selectedProject.id) && (
                                <div style={{
                                    background: 'rgba(76, 175, 80, 0.1)',
                                    border: '1px solid #4CAF50',
                                    color: '#4CAF50',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '0.9rem',
                                    marginTop: '15px'
                                }}>
                                    ✅ Ya enviaste tu solicitud para este proyecto
                                </div>
                            )}
                            {selectedProject.status === 'Terminado' && (
                                <div style={{
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    border: '1px solid #F44336',
                                    color: '#F44336',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '0.9rem',
                                    marginTop: '15px'
                                }}>
                                    Este proyecto ya ha terminado
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {filteredProjects.slice(0, visibleCount).map(project => (
                    <div
                        key={project.id}
                        className="project-card"
                        onClick={() => {
                            setSelectedProject(project);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                    >
                        <img src={project.image} alt={project.title} className="project-image" />
                        <div className="project-info">
                            <h4 className="project-title">{project.title}</h4>
                            <div style={{ marginTop: '5px', marginBottom: '10px' }}>
                                <span className={getStatusClass(project.status)} style={{ fontSize: '0.6rem' }}>{project.status}</span>
                            </div>
                            <p className="project-subtitle">{project.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {visibleCount < filteredProjects.length && (
                <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '40px' }}>
                    <button
                        onClick={() => setVisibleCount(prev => prev + 3)}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--primary-yellow)',
                            color: 'var(--primary-yellow)',
                            padding: '10px 30px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-yellow)';
                            e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--primary-yellow)';
                        }}
                    >
                        Mostrar más
                    </button>
                </div>
            )}

            {isApplying && (
                <div className="modal-overlay" onClick={() => !applyingLoading && setIsApplying(false)}>
                    <div className="application-modal fade-in" onClick={e => e.stopPropagation()}>
                        {applySuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <h3 style={{ color: '#4CAF50' }}>Solicitud Enviada</h3>
                                <p>Hemos recibido tu interés en {selectedProject?.title}. El equipo revisará tu solicitud.</p>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Inscripción: {selectedProject?.title}</h3>

                                {user && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '10px' }}>Datos de inscripción</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Nick Minecraft</span>
                                                <span style={{ color: user.minecraft_nick ? 'var(--primary-yellow)' : '#F44336', fontWeight: 'bold' }}>
                                                    {user.minecraft_nick || '⚠ No definido'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Cuenta</span>
                                                <span style={{ color: 'white', fontWeight: 'bold' }}>
                                                    {user.is_premium ? '✓ Premium' : 'No Premium'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Discord</span>
                                                <span style={{ color: user.discord_id ? 'white' : '#F44336' }}>
                                                    {user.discord_id || '⚠ No definido'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>País</span>
                                                <span style={{ color: user.country ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                                    {user.country || 'No especificado'}
                                                </span>
                                            </div>
                                        </div>
                                        {!user.minecraft_nick && (
                                            <p style={{ marginTop: '10px', color: '#F44336', fontSize: '0.8rem', background: 'rgba(244,67,54,0.1)', padding: '8px', borderRadius: '4px' }}>
                                                ⚠️ Debes completar al menos tu Nick de Minecraft en tu perfil para poder inscribirte.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <p style={{ marginBottom: '8px', opacity: 0.7, fontSize: '0.85rem' }}>Cuéntanos por qué quieres participar:</p>
                                <textarea
                                    placeholder="Escribe tu mensaje de solicitud..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    disabled={applyingLoading}
                                    style={{ minHeight: '90px', fontSize: '0.9rem' }}
                                />
                                <div className="form-actions" style={{ marginTop: '10px' }}>
                                    <button
                                        className="save-btn"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        onClick={handleApply}
                                        disabled={applyingLoading || !message.trim() || (user && !user.minecraft_nick)}
                                    >
                                        <Send size={18} />
                                        {applyingLoading ? 'Enviando...' : 'Enviar Solicitud'}
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        style={{ width: '100%', marginTop: '8px' }}
                                        onClick={() => { setIsApplying(false); setMessage(''); }}
                                        disabled={applyingLoading}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Nueva Sección: Próximos Proyectos */}
            <div className="upcoming-section">
                <div className="upcoming-header-row">
                    <h2 className="upcoming-title">Próximos proyectos</h2>
                    <div className="reel-controls">
                        <button className="reel-btn" onClick={() => scrollReel('left')}><ChevronLeft size={18} /></button>
                        <button className="reel-btn" onClick={() => scrollReel('right')}><ChevronRight size={18} /></button>
                    </div>
                </div>
                <div className="upcoming-divider"></div>

                <div className="upcoming-reel" ref={reelRef}>
                    {projects.filter(p => p.status === 'Próximamente').map((project) => (
                        <div key={project.id} className="upcoming-card">
                            {project.image && (
                                <img src={project.image} alt={project.title} className="upcoming-card-image" />
                            )}
                            <span className="upcoming-label" style={{ fontSize: project.image ? '1.4rem' : '1.1rem' }}>
                                {project.title}
                            </span>
                            <span className="upcoming-label" style={{ fontSize: '0.7rem' }}>Próximamente...</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectsSection;