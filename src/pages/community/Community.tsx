import { useState, useEffect } from 'react';
import { MessageSquare, Image as ImageIcon, Film, Camera, Play, ExternalLink } from 'lucide-react';
import type { Post } from './types';
import PostCard from './PostCard';
import PostModal from './PostModal';
import Pagination from './Pagination';

const API_BASE = 'http://localhost:8001';
const ITEMS_PER_PAGE = 5;

const Community = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newContent, setNewContent] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

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

    const handleUpload = (file: File) => {
        if (!token) return;
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/api/v1/utils/upload-media`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            setIsUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                if (data.url) {
                    if (data.type === 'video') setNewVideoUrl(data.url);
                    else setNewImageUrl(data.url);
                }
            } else {
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    alert(errorData.detail || 'Error al subir archivo');
                } catch (e) {
                    alert('Error al subir archivo');
                }
            }
        };

        xhr.onerror = () => {
            setIsUploading(false);
            alert('Error al subir archivo');
        };

        xhr.send(formData);
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

                        {isUploading && (
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                                    <span>Subiendo archivo...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#0d0d0d', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{
                                        width: `${uploadProgress}%`,
                                        height: '100%',
                                        background: 'var(--primary-yellow)',
                                        boxShadow: '0 0 10px var(--primary-yellow)',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', gap: '8px', color: isUploading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', alignItems: 'center' }} onMouseOver={e => !isUploading && (e.currentTarget.style.color = 'var(--primary-yellow)')} onMouseOut={e => !isUploading && (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                                    <ImageIcon size={20} /> Foto
                                    <input type="file" hidden accept="image/*" disabled={isUploading} onChange={e => e.target.files && handleUpload(e.target.files[0])} />
                                </label>
                                <label style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', gap: '8px', color: isUploading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', alignItems: 'center' }} onMouseOver={e => !isUploading && (e.currentTarget.style.color = 'var(--primary-yellow)')} onMouseOut={e => !isUploading && (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                                    <Film size={20} /> Subir Video
                                    <input type="file" hidden accept="video/*" disabled={isUploading} onChange={e => e.target.files && handleUpload(e.target.files[0])} />
                                </label>
                                <button onClick={() => { if (isUploading) return; const u = prompt('URL del clip (YouTube/Twitch)?'); if (u) setNewVideoUrl(u); }} style={{ background: 'none', border: 'none', display: 'flex', gap: '8px', color: isUploading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', cursor: isUploading ? 'not-allowed' : 'pointer', alignItems: 'center' }} onMouseOver={e => !isUploading && (e.currentTarget.style.color = 'var(--primary-yellow)')} onMouseOut={e => !isUploading && (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                                    <ExternalLink size={20} /> Link Clip
                                </button>
                            </div>
                            <button onClick={handleCreatePost} disabled={loading || isUploading} className="save-btn" style={{ padding: '10px 40px', fontWeight: 'bold', opacity: (loading || isUploading) ? 0.5 : 1 }}>
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
                    token={token}
                    onClose={() => setSelectedPostId(null)}
                    onRefresh={fetchPosts}
                />
            )}
        </div>
    );
};

export default Community;
