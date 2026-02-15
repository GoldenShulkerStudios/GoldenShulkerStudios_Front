import { X } from 'lucide-react';
import type { Project } from './types';

interface ProjectDetailProps {
    selectedProject: Project;
    onClose: () => void;
    getStatusClass: (status: string) => string;
    formatDate: (date: string | undefined) => string;
    hasAppliedTo: (id: number) => boolean;
    onApplyClick: () => void;
}

const ProjectDetail = ({
    selectedProject,
    onClose,
    getStatusClass,
    formatDate,
    hasAppliedTo,
    onApplyClick
}: ProjectDetailProps) => {
    return (
        <div className="project-detail-panel fade-in">
            <div className="detail-image-wrapper">
                <img src={selectedProject.image} alt={selectedProject.title} className="detail-image" />
            </div>
            <div className="detail-content">
                <button
                    className="close-detail"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>
                <h3 className="detail-title">{selectedProject.title}</h3>

                <div className="detail-meta">
                    <div className="meta-item full-width">
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
                    <button className="apply-btn" onClick={onApplyClick}>
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
    );
};

export default ProjectDetail;
