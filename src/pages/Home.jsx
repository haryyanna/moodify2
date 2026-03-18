import { useState, useEffect } from 'react';
import { ArrowRight, Heart, ShieldCheck, Sparkles, Image as ImageIcon, UserCircle2, CheckCircle2, Circle, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero-image.png';
import './Home.css';

const AFFIRMATIONS = [
  "Kamu berharga, lebih dari yang kamu tahu. ✨",
  "Tidak apa-apa untuk beristirahat sejenak hari ini. 🍃",
  "Setiap langkah kecil adalah kemajuan. Teruslah melangkah! 🌟",
  "Napas perlahan... kamu memegang kendali atas dirimu. 🧘‍♀️",
  "Perasaanmu valid. Beri ruang untuk dirimu merasa. 🫂",
  "Hari ini mungkin berat, tapi kamu jauh lebih kuat. 💪",
  "Fokuslah pada apa yang bisa kamu kendalikan hari ini. 🎯"
];

const Home = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('🤖'); // Default avatar
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inputName, setInputName] = useState('');
    
    const [dailyTasks, setDailyTasks] = useState({
        gratitude: false,
        walk: false,
        water: false,
        sleep: false
    });
    
    // Timer state for walking
    const [walkTimer, setWalkTimer] = useState(0); // in seconds (600 = 10 mins)
    const [isWalking, setIsWalking] = useState(false);

    // AI Recommendation State
    const [showRecommendation, setShowRecommendation] = useState(false);
    
    // Daily Affirmation
    const [dailyAffirmation, setDailyAffirmation] = useState('');
    
    // Welcome Popup State
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('moodify_currentUser');
        if (storedUser) {
            setUsername(storedUser);
            setIsLoggedIn(true);
            
            // Load daily tasks and history for recommendations
            const userKey = `moodify_data_${storedUser}`;
            const savedData = localStorage.getItem(userKey);
            if (savedData) {
                const userData = JSON.parse(savedData);
                
                // Set Avatar
                if (userData.avatar) {
                    setAvatar(userData.avatar);
                }

                // Tasks
                if (userData.dailyTasks) {
                    setDailyTasks(userData.dailyTasks);
                    if (userData.dailyTasks.walkTimer) {
                        setWalkTimer(userData.dailyTasks.walkTimer);
                    }
                }

                // AI Recommendation Logic (if avg mood of last 3 days < 3)
                if (userData.history && userData.history.length >= 2) {
                    const recent = userData.history.slice(-3);
                    const avgMood = recent.reduce((sum, entry) => sum + (entry.mood || 3), 0) / recent.length;
                    if (avgMood < 3) {
                        setShowRecommendation(true);
                    }
                }
            }
            
            // Check if we should show welcome popup this session
            if (!sessionStorage.getItem('moodify_welcomed')) {
                setShowWelcome(true);
                sessionStorage.setItem('moodify_welcomed', 'true');
            }
            
            // Set Daily Affirmation based on day of year
            const date = new Date();
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            setDailyAffirmation(AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]);
        }
    }, []);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (isWalking && walkTimer < 600) {
            interval = setInterval(() => {
                setWalkTimer(prev => prev + 1);
            }, 1000);
        } else if (walkTimer >= 600 && isWalking) {
            setIsWalking(false);
            toggleTask('walk', true); // auto-complete if reach 600s
        }
        return () => clearInterval(interval);
    }, [isWalking, walkTimer]);

    const toggleTask = (taskName, forceValue = null) => {
        setDailyTasks(prev => {
            const newTasks = { ...prev, [taskName]: forceValue !== null ? forceValue : !prev[taskName] };
            newTasks.walkTimer = walkTimer; // Save timer state too
            
            // Save to local storage immediately
            if (username) {
                const userKey = `moodify_data_${username}`;
                const savedData = localStorage.getItem(userKey);
                if (savedData) {
                    const userData = JSON.parse(savedData);
                    userData.dailyTasks = newTasks;
                    
                    // Add to today's progress history
                    if (userData.history && userData.history.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        const lastEntry = userData.history[userData.history.length - 1];
                        if (lastEntry.date.startsWith(today)) {
                            // Calculate completed count
                            const completedCount = Object.values(newTasks).filter(val => val === true).length;
                            lastEntry.dailyCompleted = completedCount;
                        }
                    }
                    
                    localStorage.setItem(userKey, JSON.stringify(userData));
                }
            }
            return newTasks;
        });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (inputName.trim().length > 0) {
            const name = inputName.trim();
            localStorage.setItem('moodify_currentUser', name);

            // Initialize user data structure if not exists
            const userKey = `moodify_data_${name}`;
            if (!localStorage.getItem(userKey)) {
                localStorage.setItem(userKey, JSON.stringify({
                    hasCheckedIn: false,
                    lastMood: null,
                    lastSliders: null,
                    totalSessions: 0,
                    streak: 0,
                    history: [],
                    chatHistory: [], // Initialize chat history
                    joinedAt: new Date().toISOString(), // Track join date
                    avatar: '👶', // Default new user avatar
                    theme: 'default' // Default theme
                }));
            } else {
                // If existing user, load their avatar immediately for the welcome screen
                const existingData = JSON.parse(localStorage.getItem(userKey));
                if (existingData.avatar) {
                    setAvatar(existingData.avatar);
                }
            }

            setUsername(name);
            setIsLoggedIn(true);
            setShowWelcome(true);
            sessionStorage.setItem('moodify_welcomed', 'true');
        }
    };

    // handleLogout moved to Profile.jsx

    if (!isLoggedIn) {
        return (
            <div className="home-container animate-fade-in" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingBottom: '0' }}>
                <div className="login-card glass-card">
                    <div className="logo-placeholder" style={{ margin: '0 auto 24px auto', width: '64px', height: '64px', fontSize: '32px' }}>
                        <span className="logo-icon">{avatar}</span>
                    </div>
                    <h2 className="app-name" style={{ textAlign: 'center', marginBottom: '8px' }}>MOODIFY</h2>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
                        Pendamping Mental Sehat, Berbasis AI.
                    </p>

                    <form onSubmit={handleLogin} className="login-form">
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#123e42', marginBottom: '8px', display: 'block' }}>
                            SIAPA NAMAMU?
                        </label>
                        <input
                            type="text"
                            placeholder="Ketik nama panggilanmu..."
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            required
                            autoFocus
                        />
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                            Masuk & Mulai
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container animate-fade-in">
            {/* Header */}
            <header className="home-header">
                <div className="logo-container">
                    <div className="logo-placeholder">
                        <span className="logo-icon">{avatar}</span>
                    </div>
                    <h2 className="app-name">MOODIFY</h2>
                </div>
                <button className="icon-btn-rounded" style={{ fontSize: '20px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => navigate('/profile')} title="Profil">
                    {avatar}
                </button>
            </header>

            {/* Main Content */}
            <main className="home-content">
                <div className="badge pulse-animation">
                    <Sparkles size={14} className="badge-icon" />
                    <span>Halo, {username}!</span>
                </div>

                <h1 className="hero-title">
                    Pendamping Mental Sehat, <br />
                    <span className="text-gradient">Berbasis AI.</span>
                </h1>

                <p className="hero-description">
                    MOODIFY adalah chatbot psikoedukatif yang dirancang khusus untuk memberikan dukungan emosional, edukasi kesehatan mental, dan strategi coping yang tepat untuk remaja.
                </p>

                <button className="btn-primary hero-btn" onClick={() => navigate('/chat')}>
                    Mulai Konseling
                    <ArrowRight size={18} />
                </button>

                {/* Daily Affirmation Box */}
                {dailyAffirmation && (
                    <div className="daily-affirmation glass-card hover-lift" style={{ 
                        width: '100%', 
                        maxWidth: '500px',
                        marginBottom: '24px', 
                        padding: '20px', 
                        borderRadius: '20px', 
                        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Quote size={24} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '16px', opacity: 0.3 }} />
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Kutipan Hari Ini</h4>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', lineHeight: '1.5', margin: 0 }}>"{dailyAffirmation}"</p>
                    </div>
                )}

                {/* AI Personal Recommendation */}
                {showRecommendation && (
                    <div className="glass-card" style={{ marginTop: '24px', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #8b5cf6', background: 'linear-gradient(to right, #fbfbfe, #ffffff)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Sparkles size={16} color="#8b5cf6" />
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#4c1d95', margin: 0 }}>Rekomendasi MOODIFY</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', marginBottom: '12px' }}>
                            Saya melihat kamu sering merasa sedih atau kurang bersemangat beberapa hari ini. Mungkin kamu ingin mencoba:
                        </p>
                        <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
                            <li><strong style={{ cursor:'pointer', color:'#3b82f6' }} onClick={() => navigate('/breathing')}>Latihan napas 4-4-6</strong> untuk bersantai.</li>
                            <li><strong style={{ cursor:'pointer', color:'#3b82f6' }} onClick={() => navigate('/journal')}>Journaling</strong> tentang apa yang mengganggumu.</li>
                            <li>Bicara dengan teman terdekat atau tonton sesuatu yang lucu.</li>
                        </ul>
                    </div>
                )}

                {/* Features Row */}
                <div className="features-grid" style={{ marginTop: showRecommendation ? '24px' : '0' }}>
                    <div className="feature-item">
                        <div className="feature-icon-wrapper bg-blue-soft">
                            <Heart size={20} className="icon-blue" />
                        </div>
                        <div className="feature-text">
                            <h3>Aman & Nyaman</h3>
                            <p>Ruang ceritamu 100% rahasia.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon-wrapper bg-green-soft">
                            <ShieldCheck size={20} className="icon-green" />
                        </div>
                        <div className="feature-text">
                            <h3>Teruji Klinis</h3>
                            <p>Berbasis psikologi modern.</p>
                        </div>
                    </div>
                </div>

                {/* Image Showcase Area (Moved ABOVE Daily Challenge) */}
                <div className="image-showcase-wrapper" style={{ marginBottom: '24px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div className="image-placeholder-card" style={{ padding: 0, width: '100%', maxWidth: '500px', height: 'auto', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', boxShadow: 'none' }}>
                        <img src={heroImage} alt="Mental Health Illustration" style={{ width: '100%', height: 'auto', borderRadius: '24px', objectFit: 'contain' }} />
                    </div>

                    {/* Floating Mood Badge */}
                    <div className="floating-mood-badge glass-card" style={{ top: '-10px', right: '5px' }}>
                        <span className="leaf-icon">🌿</span>
                        <div className="mood-text">
                            <span className="mood-label">MOOD HARI INI</span>
                            <span className="mood-value">Lebih Tenang</span>
                        </div>
                    </div>
                </div>

                {/* Daily Mental Health Challenge */}
                <div className="daily-challenge-box glass-card" style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#123e42', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                        🎯 Daily Mental Health Challenge
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', textAlign: 'left' }}>Hari ini coba selesaikan aktivitas berikut:</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Gratitude */}
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: dailyTasks.gratitude ? '#f0fdf4' : '#f8fafc', border: `1px solid ${dailyTasks.gratitude ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => toggleTask('gratitude')}
                        >
                            {dailyTasks.gratitude ? <CheckCircle2 size={24} color="#22c55e" /> : <Circle size={24} color="#cbd5e1" />}
                            <span style={{ fontSize: '14px', fontWeight: '500', color: dailyTasks.gratitude ? '#166534' : '#334155', textDecoration: dailyTasks.gratitude ? 'line-through' : 'none' }}>Tulis 3 hal yang kamu syukuri</span>
                        </div>

                        {/* Walk */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '12px', backgroundColor: dailyTasks.walk ? '#f0fdf4' : '#f8fafc', border: `1px solid ${dailyTasks.walk ? '#bbf7d0' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => toggleTask('walk')}>
                                {dailyTasks.walk ? <CheckCircle2 size={24} color="#22c55e" /> : <Circle size={24} color="#cbd5e1" />}
                                <span style={{ fontSize: '14px', fontWeight: '500', color: dailyTasks.walk ? '#166534' : '#334155', textDecoration: dailyTasks.walk ? 'line-through' : 'none' }}>Jalan kaki 10 menit</span>
                            </div>
                            
                            {!dailyTasks.walk && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '36px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', fontFamily: 'monospace' }}>
                                        {Math.floor(walkTimer / 60).toString().padStart(2, '0')}:{(walkTimer % 60).toString().padStart(2, '0')} / 10:00
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {!isWalking ? (
                                            <button onClick={() => setIsWalking(true)} style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '100px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', fontWeight: '600' }}>{walkTimer > 0 ? "Lanjut" : "Mulai"}</button>
                                        ) : (
                                            <button onClick={() => setIsWalking(false)} style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '100px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', fontWeight: '600' }}>Jeda</button>
                                        )}
                                        <button onClick={() => { setIsWalking(false); setWalkTimer(0); }} style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '100px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '600' }}>Stop</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Water */}
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: dailyTasks.water ? '#f0fdf4' : '#f8fafc', border: `1px solid ${dailyTasks.water ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => toggleTask('water')}
                        >
                            {dailyTasks.water ? <CheckCircle2 size={24} color="#22c55e" /> : <Circle size={24} color="#cbd5e1" />}
                            <span style={{ fontSize: '14px', fontWeight: '500', color: dailyTasks.water ? '#166534' : '#334155', textDecoration: dailyTasks.water ? 'line-through' : 'none' }}>Minum air 2 liter</span>
                        </div>
                        {/* Sleep */}
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: dailyTasks.sleep ? '#f0fdf4' : '#f8fafc', border: `1px solid ${dailyTasks.sleep ? '#bbf7d0' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => toggleTask('sleep')}
                        >
                            {dailyTasks.sleep ? <CheckCircle2 size={24} color="#22c55e" /> : <Circle size={24} color="#cbd5e1" />}
                            <span style={{ fontSize: '14px', fontWeight: '500', color: dailyTasks.sleep ? '#166534' : '#334155', textDecoration: dailyTasks.sleep ? 'line-through' : 'none' }}>Tidur lebih awal</span>
                        </div>
                    </div>
                </div>

                {/* Tempat Fitur Tambahan (Jelajahi Fitur Lainnya) */}
                <div className="additional-features-box glass-card" style={{ width: '100%', marginTop: '24px', padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Sparkles size={18} className="icon-blue" /> Jelajahi Fitur Lainnya
                    </h3>
                    
                    {/* Modifikasi Grid Layout untuk 6 Item */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                        <div onClick={() => navigate('/community')} style={{ padding: '20px 12px', backgroundColor: '#fff7ed', borderRadius: '16px', textAlign: 'center', border: '1px solid #ffedd5', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>💬</span>
                            <span style={{ fontSize: '13px', color: '#c2410c', fontWeight: '700' }}>Komunitas</span>
                        </div>
                        <div onClick={() => navigate('/breathing')} style={{ padding: '20px 12px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎧</span>
                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Meditasi</span>
                        </div>
                        <div onClick={() => navigate('/journal')} style={{ padding: '20px 12px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📔</span>
                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Jurnal</span>
                        </div>
                        <div onClick={() => navigate('/education')} style={{ padding: '20px 12px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📚</span>
                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Edukasi</span>
                        </div>
                        <div onClick={() => navigate('/game')} style={{ padding: '20px 12px', backgroundColor: '#f0fdfa', borderRadius: '16px', textAlign: 'center', border: '1px solid #ccfbf1', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎈</span>
                            <span style={{ fontSize: '13px', color: '#0d9488', fontWeight: '700' }}>Pop Fog</span>
                        </div>
                        <div onClick={() => navigate('/zen')} style={{ padding: '20px 12px', backgroundColor: '#f0f9ff', borderRadius: '16px', textAlign: 'center', border: '1px solid #bae6fd', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🍃</span>
                            <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: '700' }}>Zen Flow</span>
                        </div>
                        <div onClick={() => navigate('/joy')} style={{ padding: '20px 12px', backgroundColor: '#fdf2f8', borderRadius: '16px', textAlign: 'center', border: '1px solid #fbcfe8', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-lift">
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🌟</span>
                            <span style={{ fontSize: '13px', color: '#be185d', fontWeight: '700' }}>Joy Catch</span>
                        </div>
                    </div>
                </div>

                {/* Welcome Modal Popup */}
                {showWelcome && (
                    <div className="modal-overlay" onClick={() => setShowWelcome(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh' }}>
                        <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '400px', padding: '32px 24px', textAlign: 'center', borderRadius: '24px', background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: '64px', height: '64px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto' }}>
                                <span style={{ fontSize: '32px' }}>👋</span>
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Selamat Datang, {username}!</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
                                Senang melihatmu di MOODIFY. Kami siap menemanimu menjalani hari ini dengan lebih tenang dan positif. Yuk, jelajahi fitur-fitur yang ada!
                            </p>
                            <button className="btn-primary hover-lift" onClick={() => setShowWelcome(false)} style={{ width: '100%', padding: '14px', borderRadius: '16px' }}>
                                Mulai Jelajahi
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
