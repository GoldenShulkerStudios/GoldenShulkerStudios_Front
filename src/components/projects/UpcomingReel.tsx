import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project } from './types';

interface UpcomingReelProps {
    projects: Project[];
    reelRef: React.RefObject<HTMLDivElement | null>;
    scrollReel: (direction: 'left' | 'right') => void;
}

const UpcomingReel = ({ projects, reelRef, scrollReel }: UpcomingReelProps) => {
    const upcomingProjects = projects.filter(p => p.status === 'Próximamente');

    if (upcomingProjects.length === 0) return null;

    return (
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
                {upcomingProjects.map((project) => (
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
    );
};

export default UpcomingReel;
