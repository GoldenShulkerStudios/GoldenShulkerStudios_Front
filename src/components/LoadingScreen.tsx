import { Loader2 } from 'lucide-react';

const LoadingScreen = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#1A1A1A',
        color: '#ECC72E',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
    }}>
        <div style={{ position: 'relative' }}>
            <Loader2 size={64} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #ECC72E',
                opacity: 0.2
            }}></div>
        </div>
        <h2 style={{
            marginTop: '20px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase'
        }}>
            Cargando...
        </h2>
        <style>
            {`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            `}
        </style>
    </div>
);

export default LoadingScreen;
