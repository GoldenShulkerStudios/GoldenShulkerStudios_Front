import { Server, FolderCode, CalendarDays } from 'lucide-react';

const Services = () => {
    const services = [
        {
            icon: <Server size={60} />,
            title: "Arquitectura de Servidores",
            description: "Infraestructura de alto rendimiento y configuración técnica avanzada. Garantizamos estabilidad absoluta y una latencia mínima para que tus jugadores disfruten sin interrupciones."
        },
        {
            icon: <FolderCode size={60} />,
            title: "Desarrollo a Medida",
            description: "Creamos plugins, mods y sistemas únicos que rompen los límites de Minecraft. Si puedes imaginarlo, nosotros podemos programarlo para hacer tu servidor verdaderamente único."
        },
        {
            icon: <CalendarDays size={60} />,
            title: "Gestión de Eventos Épicos",
            description: "Diseñamos y ejecutamos eventos masivos inolvidables. Desde la narrativa hasta las mecánicas personalizadas, creamos momentos que mantienen a tu comunidad activa y apasionada."
        }
    ];

    return (
        <section className="services-section">
            <div className="services-header">
                <h2>¿Qué podemos ofrecerte?</h2>
                <p className="services-subtitle">Potenciamos tu visión con soluciones técnicas de élite diseñadas para destacar en el universo de Minecraft.</p>
            </div>

            <div className="services-divider"></div>

            <div className="services-grid">
                {services.map((service, index) => (
                    <div key={index} className="service-card">
                        <div className="service-icon-circle">
                            {service.icon}
                        </div>
                        <h3 className="service-title">{service.title}</h3>
                        <p className="service-description">{service.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Services;
