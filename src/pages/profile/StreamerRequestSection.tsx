import { useState, useEffect } from 'react';

const StreamerRequestSection = ({ token }: { token: string }) => {
    const [streamerName, setStreamerName] = useState('');
    const [channelUrl, setChannelUrl] = useState('');
    const [status, setStatus] = useState<'None' | 'Pendiente' | 'Aceptada' | 'Rechazada'>('None');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('http://localhost:8001/api/v1/streamer-requests/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Get latest request
                    const latest = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    setStatus(latest.status);
                    if (latest.status === 'Pendiente') {
                        setChannelUrl(latest.channel_url);
                        setStreamerName(latest.streamer_name || '');
                    }
                }
            })
            .catch(err => console.error(err));
    }, [token]);

    const handleSubmit = async () => {
        if (!channelUrl || !streamerName) return;
        setLoading(true);
        setMsg('');

        try {
            const res = await fetch('http://localhost:8001/api/v1/streamer-requests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    channel_url: channelUrl,
                    streamer_name: streamerName
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Error al enviar solicitud');
            }

            setStatus('Pendiente');
            setMsg('Solicitud enviada correctamente.');
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <p style={{ marginBottom: '15px' }}>Si eres creador de contenido, puedes solicitar el rol de Streamer para aparecer en nuestra sección de colaboradores.</p>

            <div className="form-group">
                <label>Nombre de Streamer (Cómo quieres aparecer)</label>
                <input
                    value={streamerName}
                    onChange={e => setStreamerName(e.target.value)}
                    placeholder="Tu nombre de contenido"
                    disabled={status === 'Pendiente' || loading}
                    style={{ width: '100%', padding: '10px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', marginBottom: '15px' }}
                />
            </div>

            <div className="form-group">
                <label>URL de tu Canal (Twitch / YouTube)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        value={channelUrl}
                        onChange={e => setChannelUrl(e.target.value)}
                        placeholder="https://twitch.tv/usuario"
                        disabled={status === 'Pendiente' || loading}
                        style={{ flex: 1, padding: '10px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'Pendiente' || loading || !channelUrl || !streamerName}
                        className="save-btn"
                        style={{ padding: '0 20px', whiteSpace: 'nowrap', opacity: (status === 'Pendiente' || loading) ? 0.5 : 1 }}
                    >
                        {loading ? 'Enviando...' : status === 'Pendiente' ? 'Pendiente' : 'Solicitar Rol'}
                    </button>
                </div>
            </div>

            {msg && <p style={{ marginTop: '10px', color: msg.includes('correctamente') ? '#4CAF50' : '#F44336' }}>{msg}</p>}

            {status === 'Pendiente' && (
                <p style={{ marginTop: '10px', color: 'var(--primary-yellow)', opacity: 0.8 }}>
                    Tu solicitud está en revisión. Te notificaremos cuando sea procesada.
                </p>
            )}

            {status === 'Rechazada' && !msg && (
                <p style={{ marginTop: '10px', color: '#F44336', opacity: 0.8 }}>
                    Tu última solicitud fue rechazada. Podrás intentar nuevamente después del tiempo de espera.
                </p>
            )}
        </div>
    );
};

export default StreamerRequestSection;
