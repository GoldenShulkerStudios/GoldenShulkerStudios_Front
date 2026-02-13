import { useState, useEffect } from 'react';
import { MessageSquare, Image as ImageIcon, Film, ArrowBigUp, ArrowBigDown, Trash2, Send, Camera, Play, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:8001';
const ITEMS_PER_PAGE = 5;

interface Comment {
    id: number;
    content: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
    user_vote: number;
    user: {
        username: string;
        role: string;
    };
}

interface Post {
    id: number;
    user_id: number;
    content?: string;
    image_url?: string;
    video_url?: string;
    upvotes: number;
    downvotes: number;
    user_vote: number;
    created_at: string;
    comments: Comment[];
    user: {
        username: string;
        role: string;
    };
}

const PostModal = ({ post, user, token, onClose, onRefresh }: { post: Post, user: any, token: string | null, onClose: () => void, onRefresh: () => void }) => {
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleVote = async (target: 'post' | 'comment', id: number, voteType: number) => {
        if (!token) return alert('Inicia sesión para votar');
        const url = target === 'post'
            ? `${API_BASE}/api/v1/posts/${id}/vote`
            : `${API_BASE}/api/v1/posts/${post.id}/comments/${id}/vote`;

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
            const res = await fetch(`${API_BASE}/api/v1/posts/${post.id}/comments`, {
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
        return url.startsWith('http') ? url : `${API_BASE}${url}`;
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

const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px', marginBottom: '30px' }}>
            <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: current === 1 ? 'default' : 'pointer', opacity: current === 1 ? 0.2 : 1 }}
            >
                <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-yellow)' }}>{current} / {total}</span>
            <button
                onClick={() => onPageChange(current + 1)}
                disabled={current === total}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: current === total ? 'default' : 'pointer', opacity: current === total ? 0.2 : 1 }}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

const Community = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newContent, setNewContent] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    // Pagination States
    const [pages, setPages] = useState({ comments: 1, videos: 1, photos: 1 });

    const token = localStorage.getItem('token');

    const fetchPosts = async () => {
        try {
            const headers: any = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_BASE}/api/v1/posts/`, { headers });
            const data = await res.json();
            if (Array.isArray(data)) setPosts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.username) setUser(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchUser();
    }, [token]);

    const handleUpload = async (file: File) => {
        if (!token) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE}/api/v1/utils/upload-media`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                return alert(data.detail || 'Error al subir archivo');
            }
            if (data.url) {
                if (data.type === 'video') setNewVideoUrl(data.url);
                else setNewImageUrl(data.url);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return alert('Debes iniciar sesión para publicar');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/posts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: newContent, image_url: newImageUrl, video_url: newVideoUrl })
            });
            if (res.ok) {
                setNewContent(''); setNewImageUrl(''); setNewVideoUrl('');
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectedPost = posts.find(p => p.id === selectedPostId);

    // Distribution & Pagination Logic
    const allComments = posts.filter(p => !p.image_url && !p.video_url);
    const allVideos = posts.filter(p => p.video_url);
    const allPhotos = posts.filter(p => p.image_url);

    const paginate = (items: Post[], page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(start, start + ITEMS_PER_PAGE);
    };

    const commentPosts = paginate(allComments, pages.comments);
    const videoPosts = paginate(allVideos, pages.videos);
    const photoPosts = paginate(allPhotos, pages.photos);

    const totalPages = {
        comments: Math.ceil(allComments.length / ITEMS_PER_PAGE),
        videos: Math.ceil(allVideos.length / ITEMS_PER_PAGE),
        photos: Math.ceil(allPhotos.length / ITEMS_PER_PAGE)
    };

    return (
        <div className="community-container fade-in" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>MOMENTOS <span style={{ color: 'var(--primary-yellow)' }}>GOLDEN</span></h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>Explora los momentos más épicos. Haz clic en cualquier publicación para ver los comentarios.</p>
            </header>

            {token && (
                <div style={{ maxWidth: '800px', margin: '0 auto 50px auto' }}>
                    <div style={{ background: '#1a1a1a', borderRadius: '15px', padding: '25px', border: '1px solid rgba(236,199,46,0.2)' }}>
                        <textarea
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            placeholder="Comparte algo asombroso..."
                            style={{ width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '15px', color: 'white', minHeight: '80px', fontSize: '1.1rem', resize: 'none' }}
                        />

                        {(newImageUrl || newVideoUrl) && (
                            <div style={{ marginTop: '15px', position: 'relative' }}>
                                {newImageUrl ? (
                                    <img src={`${API_BASE}${newImageUrl}`} alt="Preview" style={{ width: '100%', borderRadius: '10px', maxHeight: '200px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ background: '#0d0d0d', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--primary-yellow)' }}>
                                        <Play size={32} style={{ color: 'var(--primary-yellow)' }} />
                                        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Video listo para publicar</p>
                                    </div>
                                )}
                                <button onClick={() => { setNewImageUrl(''); setNewVideoUrl(''); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' }}>×</button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', gap: '8px', color: 'rgba(255,255,255,0.6)', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                                    <ImageIcon size={20} /> Foto
                                    <input type="file" hidden accept="image/*" onChange={e => e.target.files && handleUpload(e.target.files[0])} />
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', gap: '8px', color: 'rgba(255,255,255,0.6)', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                                    <Film size={20} /> Subir Video
                                    <input type="file" hidden accept="video/*" onChange={e => e.target.files && handleUpload(e.target.files[0])} />
                                </label>
                                <button onClick={() => { const u = prompt('URL del clip (YouTube/Twitch)?'); if (u) setNewVideoUrl(u); }} style={{ background: 'none', border: 'none', display: 'flex', gap: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-yellow)'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                                    <ExternalLink size={20} /> Link Clip
                                </button>
                            </div>
                            <button onClick={handleCreatePost} disabled={loading} className="save-btn" style={{ padding: '10px 40px', fontWeight: 'bold' }}>
                                {loading ? '...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="moments-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '30px', alignItems: 'start', width: '100%'
            }}>
                <div style={{ minHeight: '1350px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary-yellow)' }}>
                        <MessageSquare size={24} /> <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase' }}>Comentarios</h2>
                    </div>
                    <div>
                        {commentPosts.map(post => <PostCard key={post.id} post={post} user={user} token={token} onClick={() => setSelectedPostId(post.id)} onRefresh={fetchPosts} />)}
                    </div>
                    <Pagination current={pages.comments} total={totalPages.comments} onPageChange={(p) => setPages({ ...pages, comments: p })} />
                </div>
                <div style={{ minHeight: '1350px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#ff0000' }}>
                        <Film size={24} /> <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase' }}>Videos / Clips</h2>
                    </div>
                    <div>
                        {videoPosts.map(post => <PostCard key={post.id} post={post} user={user} token={token} onClick={() => setSelectedPostId(post.id)} onRefresh={fetchPosts} />)}
                    </div>
                    <Pagination current={pages.videos} total={totalPages.videos} onPageChange={(p) => setPages({ ...pages, videos: p })} />
                </div>
                <div style={{ minHeight: '1350px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#2196F3' }}>
                        <Camera size={24} /> <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase' }}>Fotos</h2>
                    </div>
                    <div>
                        {photoPosts.map(post => <PostCard key={post.id} post={post} user={user} token={token} onClick={() => setSelectedPostId(post.id)} onRefresh={fetchPosts} />)}
                    </div>
                    <Pagination current={pages.photos} total={totalPages.photos} onPageChange={(p) => setPages({ ...pages, photos: p })} />
                </div>
            </div>

            {selectedPost && (
                <PostModal
                    post={selectedPost}
                    user={user}
                    token={token}
                    onClose={() => setSelectedPostId(null)}
                    onRefresh={fetchPosts}
                />
            )}
        </div>
    );
};

export default Community;
