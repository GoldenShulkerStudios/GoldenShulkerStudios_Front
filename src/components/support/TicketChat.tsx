import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';

import { X, Send, LifeBuoy } from 'lucide-react';
import { API_V1_URL } from '../../config';

interface TicketChatProps {
    ticket: any;
    onClose: () => void;
    onUpdate?: () => void;
}

const TicketChat = ({ ticket: initialTicket, onClose, onUpdate }: TicketChatProps) => {
    const [ticket, setTicket] = useState(initialTicket);
    const [messages, setMessages] = useState<any[]>(initialTicket.responses || []);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const token = localStorage.getItem('token');


    // Polling "real-time" experience
    useEffect(() => {
        const fetchLatestTicket = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_V1_URL}/tickets/${initialTicket.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTicket(data);
                    setMessages(data.responses || []);
                    if (data.unread_user || data.unread_admin) {
                        window.dispatchEvent(new Event('ticketsUpdated'));
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        // Initial fetch to clear notifications immediately
        fetchLatestTicket();

        const interval = setInterval(fetchLatestTicket, 5000); // 5s poll
        return () => clearInterval(interval);
    }, [initialTicket.id, token]);


    useEffect(() => {
        // Fetch current user to differentiate messages
        if (token) {
            fetch(`${API_V1_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setCurrentUser(data))
                .catch(err => console.error(err));
        }
    }, [token]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !token) return;

        const content = newMessage;
        setNewMessage(''); // Instant feedback

        try {
            const res = await fetch(`${API_V1_URL}/tickets/${ticket.id}/responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { ...data, user: currentUser }]);
                if (onUpdate) onUpdate();

                // Fetch the ticket status to mark as read at the backend and notify sidebar
                const statusRes = await fetch(`${API_V1_URL}/tickets/${ticket.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statusRes.ok) {
                    window.dispatchEvent(new Event('ticketsUpdated'));
                }
            }

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000, padding: '20px'
        }}>
            <div style={{
                width: '100%', maxWidth: '600px', background: '#121212',
                borderRadius: '16px', display: 'flex', flexDirection: 'column',
                height: '80vh', border: '1px solid rgba(236, 199, 46, 0.2)',
                overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
            }}>
                {/* Header */}
                <header style={{
                    padding: '20px', background: 'rgba(236,199,46,0.03)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '45px', height: '45px', borderRadius: '12px',
                            background: 'rgba(236,199,46,0.1)', color: 'var(--primary-yellow)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <LifeBuoy size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '800' }}>{ticket.subject}</h3>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(236,199,46,0.1)', color: 'var(--primary-yellow)', fontWeight: 'bold' }}>
                                    {ticket.status}
                                </span>
                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                                    {ticket.category}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        color: '#fff', cursor: 'pointer', padding: '8px',
                        borderRadius: '8px', transition: 'all 0.2s'
                    }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        <X size={20} />
                    </button>
                </header>

                {/* Chat Body */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '25px',
                    display: 'flex', flexDirection: 'column', gap: '15px',
                    background: 'linear-gradient(to bottom, #121212, #0a0a0a)'
                }}>
                    {/* Original Ticket Description as first message */}
                    {(() => {
                        const isOwner = ticket.user_id === currentUser?.id;
                        return (
                            <div style={{
                                alignSelf: isOwner ? 'flex-end' : 'flex-start',
                                background: isOwner ? 'rgba(236,199,46,0.15)' : 'rgba(255,255,255,0.03)',
                                color: '#fff', padding: '15px 20px',
                                borderRadius: isOwner ? '15px 15px 4px 15px' : '15px 15px 15px 4px',
                                maxWidth: '85%', position: 'relative',
                                border: isOwner ? '1px solid rgba(236,199,46,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary-yellow)', marginBottom: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{ticket.user?.username} {isOwner ? '(Tú)' : ''}</span>
                                    <span style={{ opacity: 0.5, fontWeight: 'normal' }}>Mensaje Inicial</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{ticket.description}</p>
                                <div style={{ fontSize: '0.65rem', color: isOwner ? 'rgba(236,199,46,0.6)' : 'rgba(255,255,255,0.3)', marginTop: '8px', textAlign: 'right' }}>
                                    {new Date(ticket.created_at).toLocaleString()}
                                </div>
                            </div>
                        );
                    })()}


                    {/* Responses */}
                    {messages.map((msg, idx) => {
                        const isMe = msg.user_id === currentUser?.id;
                        return (
                            <div key={idx} style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                background: isMe ? 'rgba(236,199,46,0.15)' : 'rgba(255,255,255,0.03)',
                                color: '#fff', padding: '15px 20px',
                                borderRadius: isMe ? '15px 15px 4px 15px' : '15px 15px 15px 4px',
                                maxWidth: '85%', position: 'relative',
                                border: isMe ? '1px solid rgba(236,199,46,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}>
                                {!isMe && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-yellow)', marginBottom: '8px', fontWeight: 'bold' }}>
                                        {msg.user?.username || 'Soporte'}
                                    </div>
                                )}
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{msg.content}</p>
                                <div style={{ fontSize: '0.65rem', color: isMe ? 'rgba(236,199,46,0.6)' : 'rgba(255,255,255,0.3)', marginTop: '8px', textAlign: 'right' }}>
                                    {new Date(msg.created_at).toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Input */}
                {ticket.status !== 'Cerrado' ? (
                    <form onSubmit={handleSendMessage} style={{
                        padding: '20px', background: 'rgba(255,255,255,0.02)',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', gap: '15px'
                    }}>
                        <input
                            type="text"
                            placeholder="Escribe tu mensaje aquí..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{
                                flex: 1, background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', padding: '12px 20px',
                                color: '#fff', outline: 'none', fontSize: '0.95rem',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-yellow)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            style={{
                                background: 'var(--primary-yellow)', color: '#000',
                                border: 'none', borderRadius: '12px',
                                padding: '12px 24px', fontWeight: '900',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                opacity: newMessage.trim() ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                ) : (
                    <div style={{
                        padding: '25px', textAlign: 'center', color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)'
                    }}>
                        Este ticket ya ha sido cerrado y no admite más mensajes.
                    </div>
                )}
            </div>
        </div>
    );
};



export default TicketChat;
