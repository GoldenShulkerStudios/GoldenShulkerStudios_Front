import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { API_V1_URL } from '../config';

const TopNavbar = () => {
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);

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

    useEffect(() => {
        fetchUser();
        // Listen for changes in localStorage or custom events to update profile info
        window.addEventListener('storage', fetchUser);
        window.addEventListener('authChange', fetchUser);
        return () => {
            window.removeEventListener('storage', fetchUser);
            window.removeEventListener('authChange', fetchUser);
        };
    }, []);

    if (!user) return null;

    return (
        <div className="top-navbar">
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
        </div>
    );
};

export default TopNavbar;
