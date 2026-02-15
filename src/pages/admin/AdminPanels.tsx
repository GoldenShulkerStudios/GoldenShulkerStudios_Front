import { useState } from 'react';
import AdminInicio from './AdminInicio';
import AdminProyectos from './AdminProyectos';
import AdminNosotros from './AdminNosotros';

const AdminPanels = () => {
    const [activeTab, setActiveTab] = useState('inicio');

    const tabs = [
        { id: 'inicio', label: 'Inicio (Banners)' },
        { id: 'proyectos', label: 'Proyectos' },
        { id: 'nosotros', label: 'Nosotros (Equipo)' }
    ];

    return (
        <div className="fade-in" style={{ padding: '0px' }}>
            <div style={{ padding: '40px 40px 10px 40px' }}>
                <h2 style={{ color: 'var(--primary-yellow)', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0' }}>EDITAR PANELES</h2>
                <p style={{ opacity: 0.6, fontSize: '1rem', marginBottom: '20px' }}>Selecciona el panel que deseas modificar desde las pestañas inferiores.</p>

                <div className="admin-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tab-content" style={{ position: 'relative' }}>
                {activeTab === 'inicio' && <AdminInicio />}
                {activeTab === 'proyectos' && <AdminProyectos />}
                {activeTab === 'nosotros' && <AdminNosotros />}
            </div>

            <style>{`
                /* Remove internal padding from imported components since the wrapper handles it */
                .tab-content > div {
                    padding: 0 40px 40px 40px !important;
                }
                .tab-content h2, .tab-content .admin-section-subtitle {
                    display: none; /* Hide redundant titles */
                }
            `}</style>
        </div>
    );
};

export default AdminPanels;
