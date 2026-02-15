import React from 'react';

interface StatusBadgeProps {
    status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Aceptada':
                return {
                    background: 'rgba(76, 175, 80, 0.1)',
                    color: '#4CAF50',
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                };
            case 'Revocada':
            case 'Rechazada':
                return {
                    background: 'rgba(244, 67, 54, 0.1)',
                    color: '#F44336',
                    border: '1px solid rgba(244, 67, 54, 0.2)'
                };
            case 'Pendiente':
                return {
                    background: 'rgba(255, 193, 7, 0.1)',
                    color: '#FFC107',
                    border: '1px solid rgba(255, 193, 7, 0.2)'
                };
            default:
                return {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#9e9e9e',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                };
        }
    };

    const styles = getStatusStyles(status);

    return (
        <span className={`status-badge status-${status.toLowerCase()}`} style={{
            fontSize: '0.65rem',
            padding: '4px 10px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontWeight: '800',
            ...styles
        }}>
            {status}
        </span>
    );
};

export default StatusBadge;
