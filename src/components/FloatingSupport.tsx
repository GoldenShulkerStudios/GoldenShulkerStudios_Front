import { useNavigate } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

const FloatingSupport = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (!token) return null; // Only show for logged in users

    return (
        <button
            onClick={() => navigate('/soporte')}
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--primary-yellow)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(236, 199, 46, 0.3)',
                zIndex: 9999,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            className="floating-support-btn"
            title="Centro de Soporte"
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
        >
            <LifeBuoy size={28} />
        </button>
    );
};

export default FloatingSupport;
