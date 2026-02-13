import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Send, ExternalLink, X } from 'lucide-react';
import type { Post } from './types';

import { API_BASE_URL, API_V1_URL } from '../../config';

const PostModal = ({ post, token, onClose, onRefresh }: { post: Post, token: string | null, onClose: () => void, onRefresh: () => void }) => {
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleVote = async (target: 'post' | 'comment', id: number, voteType: number) => {
        if (!token) return alert('Inicia sesión para votar');
        const url = target === 'post'
            ? `${API_V1_URL}/posts/${id}/vote`
            : `${API_V1_URL}/posts/${post.id}/comments/${id}/vote`;

        try {
            await fetch(url, {
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

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !token) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_V1_URL}/posts/${post.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: commentText })
            });
            if (res.ok) {
                setCommentText('');
                onRefresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const isExternalVideo = (url?: string) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('twitch.tv');
    };

    const getMediaUrl = (url?: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    };

    return (
        <div className="modal-overlay fade-in" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div className="modal-content" style={{
                background: '#151515',
                width: '100%',
                maxWidth: '1100px',
                maxHeight: '90vh',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '15px', right: '15px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none', color: 'white',
                    width: '35px', height: '35px',
                    borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10
                }}><X size={20} /></button>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {(post.image_url || post.video_url) && (
                        <div style={{
                            flex: 1.2,
                            background: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {post.image_url ? (
                                <img src={getMediaUrl(post.image_url)} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                !isExternalVideo(post.video_url) ? (
                                    <video src={getMediaUrl(post.video_url)} controls style={{ width: '100%', maxHeight: '100%' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <ExternalLink size={48} style={{ color: 'var(--primary-yellow)', marginBottom: '15px' }} />
                                        <p style={{ color: 'white', marginBottom: '20px' }}>Clip de video externo</p>
                                        <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="save-btn" style={{ textDecoration: 'none' }}>Ver en YouTube/Twitch</a>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#1a1a1a'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 800, color: 'white' }}>{post.user.username}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary-yellow)', border: '1px solid rgba(236,199,46,0.2)', padding: '2px 8px', borderRadius: '4px' }}>{post.user.role}</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: '20px' }}>
                                    <button onClick={() => handleVote('post', post.id, post.user_vote === 1 ? 0 : 1)} style={{ background: 'none', border: 'none', color: post.user_vote === 1 ? 'var(--primary-yellow)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><ArrowBigUp size={22} fill={post.user_vote === 1 ? 'var(--primary-yellow)' : 'none'} /></button>
                                    <span style={{ fontWeight: 800, color: post.user_vote === 1 ? 'var(--primary-yellow)' : post.user_vote === -1 ? '#F44336' : 'white' }}>{post.upvotes - post.downvotes}</span>
                                    <button onClick={() => handleVote('post', post.id, post.user_vote === -1 ? 0 : -1)} style={{ background: 'none', border: 'none', color: post.user_vote === -1 ? '#F44336' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><ArrowBigDown size={22} fill={post.user_vote === -1 ? '#F44336' : 'none'} /></button>
                                </div>
                                <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>{post.comments.length} Comentarios</span>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scroll">
                            {post.comments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px opacity: 0.3' }}>Sin comentarios todavía.</div>
                            ) : (
                                post.comments.map(comment => (
                                    <div key={comment.id} style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--primary-yellow)', fontSize: '0.9rem' }}>{comment.user.username}</span>
                                                <span style={{ opacity: 0.3, fontSize: '0.75rem' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <button onClick={() => handleVote('comment', comment.id, comment.user_vote === 1 ? 0 : 1)} style={{ background: 'none', border: 'none', color: comment.user_vote === 1 ? 'var(--primary-yellow)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><ArrowBigUp size={18} fill={comment.user_vote === 1 ? 'var(--primary-yellow)' : 'none'} /></button>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{comment.upvotes - comment.downvotes}</span>
                                                <button onClick={() => handleVote('comment', comment.id, comment.user_vote === -1 ? 0 : -1)} style={{ background: 'none', border: 'none', color: comment.user_vote === -1 ? '#F44336' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><ArrowBigDown size={18} fill={comment.user_vote === -1 ? '#F44336' : 'none'} /></button>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {token ? (
                            <form onSubmit={handleAddComment} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                                <input
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Añadir un comentario..."
                                    style={{ flex: 1, background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white' }}
                                />
                                <button type="submit" disabled={submitting} className="save-btn" style={{ padding: '0 20px' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                Inicia sesión para comentar.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
