import React from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface HistoryItem {
    id: number;
    status: string;
    created_at: string;
    [key: string]: any;
}

interface HistoryModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    icon: LucideIcon | string;
    items: HistoryItem[];
    emptyMessage: string;
    onRevoke: (id: number) => void;
    renderItemDetails: (item: HistoryItem) => React.ReactNode;
    revokeButtonText?: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    show,
    onClose,
    title,
    subtitle,
    icon: Icon,
    items,
    emptyMessage,
    onRevoke,
    renderItemDetails,
    revokeButtonText = 'Revocar'
}) => {
    if (!show) return null;

    const historyItems = items.filter(item => item.status !== 'Pendiente');

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal-content custom-scroll" style={{
                maxWidth: '900px',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'linear-gradient(145deg, #121212, #080808)',
                border: '1px solid rgba(236, 199, 46, 0.3)',
                borderRadius: '20px',
                padding: '20px 40px 40px 40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    position: 'sticky',
                    top: 0,
                    background: '#0a0a0a',
                    zIndex: 10,
                    margin: '0 -10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(236, 199, 46, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            {typeof Icon === 'string' ? (
                                <div style={{ color: 'var(--primary-yellow)', fontSize: '1.5rem', fontWeight: 'bold' }}>{Icon}</div>
                            ) : (
                                <Icon style={{ color: 'var(--primary-yellow)' }} size={28} />
                            )}
                        </div>
                        <div>
                            <h2 style={{ color: 'var(--primary-yellow)', margin: 0, fontSize: '1.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h2>
                            <p style={{ margin: 0, opacity: 0.5, fontSize: '0.85rem' }}>{subtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {historyItems.length === 0 ? (
                        <div style={{ textAlign: 'center', opacity: 0.3, padding: '60px 20px', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                            <div style={{ scale: '2', marginBottom: '20px' }}>
                                {typeof Icon === 'string' ? Icon : <Icon size={48} />}
                            </div>
                            <p>{emptyMessage}</p>
                        </div>
                    ) : (
                        historyItems.map(item => (
                            <div key={item.id} style={{
                                padding: '20px',
                                background: 'rgba(255,255,255,0.01)',
                                borderRadius: '15px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    {renderItemDetails(item)}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        <StatusBadge status={item.status} />
                                        <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {item.status === 'Aceptada' && (
                                    <button
                                        onClick={() => onRevoke(item.id)}
                                        style={{
                                            background: 'transparent',
                                            color: '#F44336',
                                            border: '1px solid rgba(244, 67, 54, 0.3)',
                                            padding: '8px 16px',
                                            fontSize: '0.8rem',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {revokeButtonText}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
