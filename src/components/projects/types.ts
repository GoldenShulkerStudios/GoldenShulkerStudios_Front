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
