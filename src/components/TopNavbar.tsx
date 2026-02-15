import { useState, useEffect } from 'react';
import { User, Menu } from 'lucide-react';
import { API_V1_URL } from '../config';

interface TopNavbarProps {
    onMenuClick: () => void;
}

const TopNavbar = ({ onMenuClick }: TopNavbarProps) => {
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);
    const [showProfileDot, setShowProfileDot] = useState(false);

    const fetchUser = () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            fetch(`${API_V1_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.username) setUser(data);
                })
                .catch(err => console.error("Error fetching user in TopNavbar:", err));
        } else {
            setUser(null);
        }
    };

    const fetchProfileNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const [appsRes, streamerRes] = await Promise.all([
                fetch(`${API_V1_URL}/applications/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_V1_URL}/streamer-requests/me`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const appsData = await appsRes.json();
            const streamerData = await streamerRes.json();
            const dismissedNotifs = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');

            let hasNew = false;
            if (Array.isArray(appsData)) {
                const importantApps = appsData.filter(app => app.status === 'Aceptada' || app.status === 'Revocada');
                hasNew = hasNew || importantApps.some(app => !dismissedNotifs.includes(`app-${app.id}-${app.status}`));
            }
            if (Array.isArray(streamerData)) {
                const importantStreamers = streamerData.filter(req => req.status === 'Aceptada' || req.status === 'Revocada');
                hasNew = hasNew || importantStreamers.some(req => !dismissedNotifs.includes(`streamer-${req.id}-${req.status}`));
            }

            setShowProfileDot(hasNew);
        } catch (err) {
            console.error("Error fetching profile notifications in Navbar:", err);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchProfileNotifications();

        window.addEventListener('storage', fetchUser);
        window.addEventListener('authChange', fetchUser);
        window.addEventListener('profileUpdated', fetchProfileNotifications);

        const interval = setInterval(fetchProfileNotifications, 1000 * 30);

        return () => {
            window.removeEventListener('storage', fetchUser);
            window.removeEventListener('authChange', fetchUser);
            window.removeEventListener('profileUpdated', fetchProfileNotifications);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="top-navbar">
            <button className="mobile-menu-btn" onClick={onMenuClick}>
                <Menu size={24} />
                {showProfileDot && <span className="mobile-notif-dot"></span>}
            </button>

            <div className="mobile-logo">
                <img src="/logo.png" alt="Logo" style={{ height: '30px' }} />
            </div>

            {user && (
                <div className="top-user-info">
                    <div className="top-user-details">
                        <span className="top-username">{user.username}</span>
                        <span className="top-role">
                            {user.role === 'Admin' ? 'admin' :
                                user.role === 'Usuario' ? 'usuario' :
                                    user.role === 'Streamer' ? 'streamer' : user.role.toLowerCase()}
                        </span>
                    </div>
                    <div className="top-avatar">
                        <User size={20} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopNavbar;

