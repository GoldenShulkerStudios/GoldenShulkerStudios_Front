import React from 'react';
import { X } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface AdminRequestCardProps {
    id: number;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    status: string;
    details?: React.ReactNode;
    onAccept: () => void;
    onReject: () => void;
    onDelete?: () => void;
    acceptLabel?: string;
    rejectLabel?: string;
    hasNotification?: boolean;
}


const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
    title,
    subtitle,
    status,
    details,
    onAccept,
    onReject,
    onDelete,
    acceptLabel = "Aceptar",
    rejectLabel = "Rechazar",
    hasNotification = false
}) => {

    return (
        <div style={{
            padding: '15px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'transform 0.2s',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-yellow)' }}>
                        {title}
                    </span>
                    {subtitle && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{subtitle}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {hasNotification && (
                        <span style={{
                            width: '10px', height: '10px',
                            background: 'var(--primary-yellow)',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px var(--primary-yellow)',
                            border: '1.5px solid #000'
                        }}></span>
                    )}
                    <StatusBadge status={status} />

                    {onDelete && (
                        <button
                            onClick={onDelete}
                            style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', padding: '2px', opacity: 0.6 }}
                            title="Eliminar/Cancelar"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {details && (
                <div style={{
                    fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.03)'
                }}>
                    {details}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button
                    onClick={onAccept}
                    className="admin-btn"
                    style={{
                        background: 'rgba(76, 175, 80, 0.2)',
                        color: '#4CAF50',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        flex: 1,
                        fontWeight: 'bold',
                        borderRadius: '6px'
                    }}
                >
                    {acceptLabel}
                </button>
                <button
                    onClick={onReject}
                    className="admin-btn"
                    style={{
                        background: 'rgba(244, 67, 54, 0.2)',
                        color: '#F44336',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        flex: 1,
                        fontWeight: 'bold',
                        borderRadius: '6px'
                    }}
                >
                    {rejectLabel}
                </button>
            </div>
        </div>
    );
};


export default AdminRequestCard;
