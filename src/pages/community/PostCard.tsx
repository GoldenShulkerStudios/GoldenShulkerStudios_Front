import React from 'react';
import { MessageSquare, ArrowBigUp, ArrowBigDown, Trash2, Play } from 'lucide-react';
import type { Post } from './types';

const API_BASE = 'http://localhost:8001';

const PostCard = ({ post, user, token, onClick, onRefresh }: { post: Post, user: any, token: string | null, onClick: () => void, onRefresh: () => void }) => {

    const handleVote = async (e: React.MouseEvent, voteType: number) => {
        e.stopPropagation();
        if (!token) return alert('Inicia sesión para votar');
        try {
            await fetch(`${API_BASE}/api/v1/posts/${post.id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ vote: voteType })
            });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar esta publicación?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/posts/${post.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const getImageUrl = (url?: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${API_BASE}${url}`;
    };

    return (
        <div className="post-card" onClick={onClick} style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '20px',
            cursor: 'pointer',
            overflow: 'hidden',
            width: '100%',
            height: '240px',
            minHeight: '240px',
            maxHeight: '240px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, border-color 0.2s',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(236,199,46,0.5)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>

            {post.image_url && (
                <div style={{ width: '100%', height: '110px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={getImageUrl(post.image_url)} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}

            {post.video_url && !post.image_url && (
                <div style={{ width: '100%', height: '110px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={40} style={{ color: 'var(--primary-yellow)', opacity: 0.7 }} />
                </div>
            )}

            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>{post.user.username}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--primary-yellow)', textTransform: 'uppercase', border: '1px solid rgba(236,199,46,0.3)', padding: '1px 5px', borderRadius: '3px' }}>{post.user.role}</span>
                    </div>
                    {(user?.role === 'Admin' || user?.id === post.user_id) && (
                        <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'rgba(244, 67, 54, 0.4)', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {post.content && (
                        <p style={{
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: (!post.image_url && !post.video_url) ? '1rem' : '0.85rem',
                            lineHeight: '1.4',
                            marginBottom: '8px',
                            display: '-webkit-box',
                            WebkitLineClamp: (!post.image_url && !post.video_url) ? 7 : 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontStyle: (!post.image_url && !post.video_url) ? 'italic' : 'normal',
                            padding: (!post.image_url && !post.video_url) ? '0 5px' : '0'
                        }}>
                            {(!post.image_url && !post.video_url) && '"'}{post.content}{(!post.image_url && !post.video_url) && '"'}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button onClick={(e) => handleVote(e, post.user_vote === 1 ? 0 : 1)} style={{ background: 'none', border: 'none', color: post.user_vote === 1 ? 'var(--primary-yellow)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><ArrowBigUp size={22} fill={post.user_vote === 1 ? 'var(--primary-yellow)' : 'none'} /></button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: post.user_vote === 1 ? 'var(--primary-yellow)' : post.user_vote === -1 ? '#F44336' : 'white' }}>{post.upvotes - post.downvotes}</span>
                        <button onClick={(e) => handleVote(e, post.user_vote === -1 ? 0 : -1)} style={{ background: 'none', border: 'none', color: post.user_vote === -1 ? '#F44336' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><ArrowBigDown size={22} fill={post.user_vote === -1 ? '#F44336' : 'none'} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.5, fontSize: '0.8rem' }}>
                        <MessageSquare size={14} />
                        {post.comments.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
