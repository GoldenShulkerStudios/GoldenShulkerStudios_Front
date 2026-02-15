import { useState, useEffect } from 'react';
import { MessageSquare, Image as ImageIcon, Film, Camera, Play, ExternalLink } from 'lucide-react';
import type { Post } from './types';
import PostCard from './PostCard';
import PostModal from './PostModal';
import Pagination from './Pagination';
import { API_BASE_URL, API_V1_URL } from '../../config';
import { validateCommunityAction } from '../../validations/communityValidation';

const ITEMS_PER_PAGE = 3;

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
            const res = await fetch(`${API_V1_URL}/posts/`, { headers });
            const data = await res.json();
            if (Array.isArray(data)) setPosts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_V1_URL}/me`, {
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
        xhr.open('POST', `${API_V1_URL}/utils/upload-media`, true);
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

    const handleAddLink = () => {
        if (!validateCommunityAction(token)) return;
        const url = prompt('Introduce la URL del clip (YouTube, Twitch, etc.):');
        if (url) {
            setNewVideoUrl(url);
            setNewImageUrl(''); // Priorizar video sobre imagen en previsualización
        }
    };

    const handleCreatePost = async () => {
        if (!validateCommunityAction(token)) return;
        if (!newContent && !newImageUrl && !newVideoUrl) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_V1_URL}/posts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newContent,
                    image_url: newImageUrl,
                    video_url: newVideoUrl
                })
            });
            if (res.ok) {
                setNewContent('');
                setNewImageUrl('');
                setNewVideoUrl('');
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter and Pagination logic
    const selectedPost = posts.find(p => p.id === selectedPostId);

    const filterPosts = (posts: Post[], type: 'text' | 'video' | 'photo') => {
        if (type === 'video') return posts.filter(p => p.video_url);
        if (type === 'photo') return posts.filter(p => p.image_url && !p.video_url);
        return posts.filter(p => p.content && !p.image_url && !p.video_url);
    };

    const getPaginated = (posts: Post[], page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return posts.slice(start, start + ITEMS_PER_PAGE);
    };

    const commentPosts = filterPosts(posts, 'text');
    const videoPosts = filterPosts(posts, 'video');
    const photoPosts = filterPosts(posts, 'photo');

    const totalPages = (posts: Post[]) => Math.ceil(posts.length / ITEMS_PER_PAGE);

    return (
        <div className="community-container">
            <header className="community-header fade-in">
                <h1>MOMENTOS <span className="highlight">GOLDEN</span></h1>
                <p>La red de comunicación oficial de Golden Shulker Studios. Comparte, comenta y vota lo mejor del servidor.</p>
            </header>

            <div className="community-grid">
                {/* Create Post Section */}
                <div className="create-post-card">
                    <div className="create-post-header">
                        {user && (
                            <div className="user-avatar-small">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                        <textarea
                            placeholder="Comparte algo asombroso..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                    </div>

                    {/* Upload progress bar */}
                    {isUploading && (
                        <div className="upload-progress-container">
                            <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            <span className="upload-progress-text">{uploadProgress}%</span>
                        </div>
                    )}

                    {(newImageUrl || newVideoUrl) && (
                        <div className="post-preview-media">
                            {newImageUrl && <img src={newImageUrl.startsWith('http') ? newImageUrl : `${API_BASE_URL}${newImageUrl}`} alt="Preview" />}
                            {newVideoUrl && <video src={newVideoUrl.startsWith('http') ? newVideoUrl : `${API_BASE_URL}${newVideoUrl}`} controls />}
                            <button onClick={() => { setNewImageUrl(''); setNewVideoUrl(''); }} className="remove-media">×</button>
                        </div>
                    )}

                    <div className="create-post-actions">
                        <div className="post-tool-buttons">
                            <label className={`tool-btn ${isUploading ? 'disabled' : ''}`} onClick={() => !validateCommunityAction(token)}>
                                <Camera size={20} />
                                <span>Foto</span>
                                <input type="file" accept="image/*" onChange={(e) => token && e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={isUploading || !token} hidden />
                            </label>
                            <label className={`tool-btn ${isUploading ? 'disabled' : ''}`} onClick={() => !validateCommunityAction(token)}>
                                <Film size={20} />
                                <span>Subir Video</span>
                                <input type="file" accept="video/*" onChange={(e) => token && e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={isUploading || !token} hidden />
                            </label>
                            <button className="tool-btn" onClick={handleAddLink} disabled={isUploading}>
                                <ExternalLink size={20} />
                                <span>Link Clip</span>
                            </button>
                        </div>
                        <button
                            className="publish-btn"
                            disabled={loading || isUploading || (!!token && !newContent && !newImageUrl && !newVideoUrl)}
                            onClick={handleCreatePost}
                        >
                            Publicar
                        </button>
                    </div>
                </div>

                {/* Tabs / Feeds */}
                <div className="community-feeds">
                    <section className="feed-section">
                        <div className="section-header">
                            <MessageSquare size={20} />
                            <h3>Conversaciones</h3>
                        </div>
                        <div className="posts-list">
                            {getPaginated(commentPosts, pages.comments).map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    user={user}
                                    token={token}
                                    onClick={() => setSelectedPostId(post.id)}
                                    onRefresh={fetchPosts}
                                />
                            ))}
                            <Pagination
                                current={pages.comments}
                                total={totalPages(commentPosts)}
                                onPageChange={(p) => setPages({ ...pages, comments: p })}
                            />
                        </div>
                    </section>

                    <section className="feed-section">
                        <div className="section-header">
                            <Play size={20} />
                            <h3>Clips y Videos</h3>
                        </div>
                        <div className="posts-list">
                            {getPaginated(videoPosts, pages.videos).map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    user={user}
                                    token={token}
                                    onClick={() => setSelectedPostId(post.id)}
                                    onRefresh={fetchPosts}
                                />
                            ))}
                            <Pagination
                                current={pages.videos}
                                total={totalPages(videoPosts)}
                                onPageChange={(p) => setPages({ ...pages, videos: p })}
                            />
                        </div>
                    </section>

                    <section className="feed-section">
                        <div className="section-header">
                            <ImageIcon size={20} />
                            <h3>Fotos</h3>
                        </div>
                        <div className="posts-list">
                            {getPaginated(photoPosts, pages.photos).map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    user={user}
                                    token={token}
                                    onClick={() => setSelectedPostId(post.id)}
                                    onRefresh={fetchPosts}
                                />
                            ))}
                            <Pagination
                                current={pages.photos}
                                total={totalPages(photoPosts)}
                                onPageChange={(p) => setPages({ ...pages, photos: p })}
                            />
                        </div>
                    </section>
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
