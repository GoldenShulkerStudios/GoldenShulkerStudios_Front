import type { Project } from './types';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
    getStatusClass: (status: string) => string;
}

const ProjectCard = ({ project, onClick, getStatusClass }: ProjectCardProps) => {
    return (
        <div
            className="project-card"
            onClick={onClick}
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
    );
};

export default ProjectCard;
