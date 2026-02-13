
const Footer = () => {
    return (
        <footer style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: 'auto', // Pushes it to the bottom if content is short
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.75rem'
        }}>
            <p style={{ margin: 0 }}>
                © 2026 Todos los derechos reservado <span style={{ color: 'var(--primary-yellow)', fontWeight: 'bold' }}>Golden Shulker Studios</span>
            </p>
        </footer>
    );
};

export default Footer;
