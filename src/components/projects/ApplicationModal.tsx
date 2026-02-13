import { Send } from 'lucide-react';
import type { Project } from './types';

interface ApplicationModalProps {
    selectedProject: Project | null;
    user: any;
    message: string;
    setMessage: (msg: string) => void;
    applyingLoading: boolean;
    applySuccess: boolean;
    onApply: () => void;
    onClose: () => void;
}

const ApplicationModal = ({
    selectedProject,
    user,
    message,
    setMessage,
    applyingLoading,
    applySuccess,
    onApply,
    onClose
}: ApplicationModalProps) => {
    return (
        <div className="modal-overlay" onClick={() => !applyingLoading && onClose()}>
            <div className="application-modal fade-in" onClick={e => e.stopPropagation()}>
                {applySuccess ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <h3 style={{ color: '#4CAF50' }}>Solicitud Enviada</h3>
                        <p>Hemos recibido tu interés en {selectedProject?.title}. El equipo revisará tu solicitud.</p>
                    </div>
                ) : (
                    <>
                        <h3 style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Inscripción: {selectedProject?.title}</h3>

                        {user && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '10px' }}>Datos de inscripción</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Nick Minecraft</span>
                                        <span style={{ color: user.minecraft_nick ? 'var(--primary-yellow)' : '#F44336', fontWeight: 'bold' }}>
                                            {user.minecraft_nick || '⚠ No definido'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Cuenta</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>
                                            {user.is_premium ? '✓ Premium' : 'No Premium'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Discord</span>
                                        <span style={{ color: user.discord_id ? 'white' : '#F44336' }}>
                                            {user.discord_id || '⚠ No definido'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>País</span>
                                        <span style={{ color: user.country ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                            {user.country || 'No especificado'}
                                        </span>
                                    </div>
                                </div>
                                {!user.minecraft_nick && (
                                    <p style={{ marginTop: '10px', color: '#F44336', fontSize: '0.8rem', background: 'rgba(244,67,54,0.1)', padding: '8px', borderRadius: '4px' }}>
                                        ⚠️ Debes completar al menos tu Nick de Minecraft en tu perfil para poder inscribirte.
                                    </p>
                                )}
                            </div>
                        )}

                        <p style={{ marginBottom: '8px', opacity: 0.7, fontSize: '0.85rem' }}>Cuéntanos por qué quieres participar:</p>
                        <textarea
                            placeholder="Escribe tu mensaje de solicitud..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={applyingLoading}
                            style={{ minHeight: '90px', fontSize: '0.9rem' }}
                        />
                        <div className="form-actions" style={{ marginTop: '10px' }}>
                            <button
                                className="save-btn"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                onClick={onApply}
                                disabled={applyingLoading || !message.trim() || (user && !user.minecraft_nick)}
                            >
                                <Send size={18} />
                                {applyingLoading ? 'Enviando...' : 'Enviar Solicitud'}
                            </button>
                            <button
                                className="cancel-btn"
                                style={{ width: '100%', marginTop: '8px' }}
                                onClick={onClose}
                                disabled={applyingLoading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;
