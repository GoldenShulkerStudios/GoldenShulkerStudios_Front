import { useState, useEffect } from 'react';
import { Twitter, Facebook, Instagram, Github, Youtube, Twitch } from 'lucide-react';
import { API_BASE_URL, API_V1_URL } from '../config';

export interface TeamMember {
    id: number;
    name: string;
    image: string;
    socials: {
        platform: 'twitter' | 'facebook' | 'instagram' | 'github' | 'youtube' | 'twitch' | 'discord';
        url: string;
    }[];
}

export interface Streamer {
    id: number;
    name: string;
    image: string;
    url: string;
    isLive: boolean;
}



const SocialIcon = ({ platform }: { platform: string }) => {
    switch (platform) {
        case 'twitter': return <Twitter size={20} />;
        case 'facebook': return <Facebook size={20} />;
        case 'instagram': return <Instagram size={20} />;
        case 'github': return <Github size={20} />;
        case 'youtube': return <Youtube size={20} />;
        case 'twitch': return <Twitch size={20} />;
        default: return null;
    }
};

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.06,72.06,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.63.45,80.21a105.73,105.73,0,0,0,32.22,16.15,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.24-16.14C129.5,50.28,125.09,26.56,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

const AboutUs = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [streamers, setStreamers] = useState<Streamer[]>([]);

    useEffect(() => {
        // Fetch Team Members
        fetch(`${API_V1_URL}/team/`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTeamMembers(data.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        image: m.image_url?.startsWith('http') ? m.image_url : `${API_BASE_URL}${m.image_url}`,
                        socials: m.social_links.map((s: any) => ({
                            platform: s.platform.toLowerCase(),
                            url: s.url
                        }))
                    })));
                }
            })
            .catch(err => console.error(err));

        // Fetch Streamers
        fetch(`${API_V1_URL}/streamers/`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStreamers(data.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        image: s.image_url?.startsWith('http') ? s.image_url : `${API_BASE_URL}${s.image_url}`,
                        url: s.channel_url,
                        isLive: s.is_live
                    })));
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="about-container fade-in">
            <div className="about-header">
                <h2>¿Quienes somos?</h2>
                <p className="about-subtitle">Somos aficionados a Minecraft con mas de 5 años de experiencia sobreviviendo en el mundo cuadrado</p>
            </div>

            <div className="about-divider"></div>

            <div className="team-grid">
                {teamMembers.map((member) => (
                    <div key={member.id} className="team-card">
                        <div className="member-image-container">
                            <img src={member.image} alt={member.name} className="member-image" />
                        </div>
                        <div className="member-info">
                            <h3 className="member-name">{member.name}</h3>
                            <div className="member-socials-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <div className="member-socials">
                                    {member.socials
                                        .filter(social => ['twitter', 'instagram', 'twitch', 'youtube'].includes(social.platform))
                                        .map((social, idx) => (
                                            <a key={idx} href={social.url} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <SocialIcon platform={social.platform} />
                                            </a>
                                        ))}
                                </div>
                                {member.socials.find(s => s.platform === 'discord') && (
                                    <div className="discord-badge" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(88, 101, 242, 0.1)',
                                        color: '#5865F2',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        border: '1px solid rgba(88, 101, 242, 0.2)'
                                    }}>
                                        <DiscordIcon size={14} />
                                        <span>{member.socials.find(s => s.platform === 'discord')?.url}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section: Streamers */}
            <div className="streamers-section" style={{ marginTop: '80px' }}>
                <div className="about-header">
                    <h2>Streamers que nos apoyan</h2>
                    <p className="about-subtitle">Nuestros aliados que llevan el contenido a otro nivel</p>
                </div>

                <div className="streamers-grid">
                    {streamers.map((streamer) => (
                        <a
                            key={streamer.id}
                            href={streamer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="streamer-banner"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '15px 20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                                gap: '15px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    background: '#6441a5',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Twitch size={24} color="white" />
                                </div>
                                <span className="streamer-name" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{streamer.name}</span>
                            </div>

                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
