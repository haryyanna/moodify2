import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Heart, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Community.css';

// Initial dummy posts to populate the board
const DUMMY_POSTS = [
  { id: 1, text: "Hari ini lumayan berat, tapi aku berhasil menyelesaikannya. Proud of myself! ✨", author: "anon_12a", timestamp: Date.now() - 3600000, likes: 12 },
  { id: 2, text: "Ada yang ngerasa cemas tiba-tiba nggak sih malam ini? 🥺", author: "anon_89x", timestamp: Date.now() - 7200000, likes: 8 },
  { id: 3, text: "Mencoba dengerin lofi dari Moodify bantu banget buat fokus belajar. Semangat semuanya!", author: "anon_45b", timestamp: Date.now() - 86400000, likes: 24 }
];

const Community = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [likedPosts, setLikedPosts] = useState(new Set());

    useEffect(() => {
        // Load posts from localStorage (shared across users in this simulated local app)
        const savedPosts = localStorage.getItem('moodify_community_posts');
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        } else {
            // Initialize with dummy data
            setPosts(DUMMY_POSTS);
            localStorage.setItem('moodify_community_posts', JSON.stringify(DUMMY_POSTS));
        }

        // Load liked posts for current user
        const currentUser = localStorage.getItem('moodify_currentUser');
        if (currentUser) {
            const liked = localStorage.getItem(`moodify_liked_posts_${currentUser}`);
            if (liked) {
                setLikedPosts(new Set(JSON.parse(liked)));
            }
        }
    }, []);

    const handlePost = (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const post = {
            id: Date.now(),
            text: newPost.trim(),
            author: `anon_${Math.random().toString(36).substring(2, 5)}`,
            timestamp: Date.now(),
            likes: 0
        };

        const updatedPosts = [post, ...posts];
        setPosts(updatedPosts);
        localStorage.setItem('moodify_community_posts', JSON.stringify(updatedPosts));
        setNewPost('');
    };

    const handleLike = (postId) => {
        const currentUser = localStorage.getItem('moodify_currentUser');
        if (!currentUser) return;

        const newLikedPosts = new Set(likedPosts);
        let likeDelta = 1;

        if (newLikedPosts.has(postId)) {
            newLikedPosts.delete(postId);
            likeDelta = -1;
        } else {
            newLikedPosts.add(postId);
        }

        setLikedPosts(newLikedPosts);
        localStorage.setItem(`moodify_liked_posts_${currentUser}`, JSON.stringify([...newLikedPosts]));

        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, likes: p.likes + likeDelta };
            }
            return p;
        });

        setPosts(updatedPosts);
        localStorage.setItem('moodify_community_posts', JSON.stringify(updatedPosts));
    };

    const formatTime = (timestamp) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} hari yang lalu`;
        if (hours > 0) return `${hours} jam yang lalu`;
        if (minutes > 0) return `${minutes} menit yang lalu`;
        return 'Baru saja';
    };

    return (
        <div className="community-container animate-fade-in">
            {/* Header */}
            <header className="community-header">
                <button className="icon-btn-rounded" onClick={() => navigate('/home')}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2>Ruang Berbagi</h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Anonim & Aman</span>
                </div>
                <div style={{ width: 40 }} /> {/* Spacer */}
            </header>

            <main className="community-content">
                <div className="community-info-card glass-card">
                    <p>Bagikan perasaanmu secara anonim. Berikan dukungan positif kepada teman-teman lain dengan memberikan 💖.</p>
                </div>

                {/* Input Area */}
                <form onSubmit={handlePost} className="post-input-container glass-card">
                    <textarea 
                        placeholder="Apa yang sedang kamu rasakan saat ini?..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        maxLength={280}
                    />
                    <div className="post-input-footer">
                        <span className="char-count">{newPost.length}/280</span>
                        <button type="submit" className="btn-primary post-btn" disabled={!newPost.trim()}>
                            Bagikan <Send size={16} />
                        </button>
                    </div>
                </form>

                {/* Feed */}
                <div className="posts-feed">
                    {posts.map(post => (
                        <div key={post.id} className="post-card glass-card">
                            <div className="post-header">
                                <div className="post-author">
                                    <div className="author-avatar"><User size={14} /></div>
                                    <span>{post.author}</span>
                                </div>
                                <div className="post-time">
                                    <Clock size={12} />
                                    <span>{formatTime(post.timestamp)}</span>
                                </div>
                            </div>
                            
                            <p className="post-body">{post.text}</p>
                            
                            <div className="post-actions">
                                <button 
                                    className={`like-btn ${likedPosts.has(post.id) ? 'liked' : ''} hover-lift`}
                                    onClick={() => handleLike(post.id)}
                                >
                                    <Heart size={16} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                                    <span>{post.likes}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Community;
