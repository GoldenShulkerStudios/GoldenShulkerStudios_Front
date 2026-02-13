import { useRef, useEffect, useState } from 'react';
import type { Project } from './types';
import ProjectCard from './ProjectCard';
import ProjectDetail from './ProjectDetail';
import ApplicationModal from './ApplicationModal';
import UpcomingReel from './UpcomingReel';

const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const ProjectsSection = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filter, setFilter] = useState('Todos');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [message, setMessage] = useState('');
    const [applyingLoading, setApplyingLoading] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [userApplications, setUserApplications] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [visibleCount, setVisibleCount] = useState(6);

    const reelRef = useRef<HTMLDivElement>(null);
    const token = localStorage.getItem('token');

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:8001/api/v1/projects/');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Map API "image_url" to component "image"
                const mapped = data.map((p: any) => ({
                    ...p,
                    image: p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `http://localhost:8001${p.image_url}`) : 'https://via.placeholder.com/400x200',
                    subtitle: p.tagline,
                    cliente: p.client,
                    duracion: p.duration,
                    adds: Array.isArray(p.adds) ? p.adds : (typeof p.adds === 'string' ? JSON.parse(p.adds) : [])
                }));
                // Sort by featured first
                const sorted = mapped.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
                setProjects(sorted);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserApps = async () => {
        if (!token) return;
        try {
            const [resApps, resMe] = await Promise.all([
                fetch('http://localhost:8001/api/v1/applications/me', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8001/api/v1/me', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const apps = await resApps.json();
            const me = await resMe.json();
            if (Array.isArray(apps)) setUserApplications(apps);
            if (me.username) setUser(me);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchUserApps();
    }, [token]);

    const categories = ['Todos', 'Propios', 'Streamers', 'Privados'];
    const filteredProjects = projects.filter(p => p.status !== 'Próximamente' && (filter === 'Todos' || p.category === filter));
    const currentProject = projects.find(p => p.is_featured && p.status !== 'Próximamente');

    const scrollReel = (direction: 'left' | 'right') => {
        if (reelRef.current) {
            const scrollAmount = 320;
            reelRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const hasAppliedTo = (projectId: number) => {
        return userApplications.some(app => app.project_id === projectId);
    };

    const handleApply = async () => {
        if (!selectedProject || !token) return;
        setApplyingLoading(true);
        try {
            const res = await fetch('http://localhost:8001/api/v1/applications/', {
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

            if (res.ok) {
                setApplySuccess(true);
                fetchUserApps();
                setTimeout(() => {
                    setIsApplying(false);
                    setApplySuccess(false);
                    setMessage('');
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.detail || 'Error al enviar solicitud');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setApplyingLoading(false);
        }
    };

    const getStatusClass = (status: string) => {
        return `status-tag ${status.toLowerCase().replace(/ /g, '-')}`;
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
                    <ProjectDetail
                        selectedProject={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        getStatusClass={getStatusClass}
                        formatDate={formatDate}
                        hasAppliedTo={hasAppliedTo}
                        onApplyClick={() => setIsApplying(true)}
                    />
                )}

                {filteredProjects.slice(0, visibleCount).map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => {
                            setSelectedProject(project);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        getStatusClass={getStatusClass}
                    />
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
                <ApplicationModal
                    selectedProject={selectedProject}
                    user={user}
                    message={message}
                    setMessage={setMessage}
                    applyingLoading={applyingLoading}
                    applySuccess={applySuccess}
                    onApply={handleApply}
                    onClose={() => { setIsApplying(false); setMessage(''); }}
                />
            )}

            <UpcomingReel
                projects={projects}
                reelRef={reelRef}
                scrollReel={scrollReel}
            />
        </div>
    );
};

export default ProjectsSection;
