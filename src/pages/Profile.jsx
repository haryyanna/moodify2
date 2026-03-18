import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle2, LogOut, Settings, Award, CalendarDays, Clock, Bell, Moon, Palette, Smile } from 'lucide-react';
import './Profile.css';

const THEMES = [
    { id: 'default', name: 'Mint', color: '#2a9d8f' },
    { id: 'ocean', name: 'Ocean', color: '#0284c7' },
    { id: 'sunset', name: 'Sunset', color: '#f97316' },
    { id: 'lavender', name: 'Lavender', color: '#8b5cf6' }
];

const AVATARS = ['👶', '🦊', '🐱', '🐼', '🐨', '🐸', '🦉', '🦋'];

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Dummy settings state for UI
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: false,
    });
    
    const [activeTheme, setActiveTheme] = useState('default');
    const [activeAvatar, setActiveAvatar] = useState('👶');

    useEffect(() => {
        const storedUser = localStorage.getItem('moodify_currentUser');
        if (!storedUser) {
            navigate('/home');
            return;
        }

        setUsername(storedUser);
        const userKey = `moodify_data_${storedUser}`;
        const savedData = localStorage.getItem(userKey);
        
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setUserData(parsed);
            if (parsed.theme) setActiveTheme(parsed.theme);
            if (parsed.avatar) setActiveAvatar(parsed.avatar);
        }
    }, [navigate]);

    const savePreferences = (themeStr, avatarStr) => {
        if (!username) return;
        const userKey = `moodify_data_${username}`;
        const savedData = localStorage.getItem(userKey);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            parsed.theme = themeStr;
            parsed.avatar = avatarStr;
            localStorage.setItem(userKey, JSON.stringify(parsed));
        }
        
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', themeStr);
    };

    const handleThemeChange = (themeId) => {
        setActiveTheme(themeId);
        savePreferences(themeId, activeAvatar);
    };

    const handleAvatarChange = (avatar) => {
        setActiveAvatar(avatar);
        savePreferences(activeTheme, avatar);
    };

    const handleLogout = () => {
        localStorage.removeItem('moodify_currentUser');
        navigate('/home');
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!userData) return null; // or a loading spinner

    // Calculate days joined
    const joinedDate = new Date(userData.joinedAt || Date.now());
    const daysJoined = Math.max(1, Math.ceil((new Date() - joinedDate) / (1000 * 60 * 60 * 24)));

    return (
        <div className="profile-container animate-fade-in">
            {/* Header */}
            <header className="profile-header">
                <button className="icon-btn-rounded" onClick={() => navigate('/home')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Profil & Pengaturan</h2>
                <div style={{ width: 40 }} /> {/* Spacer */}
            </header>

            <main className="profile-content">
                {/* User Info Card */}
                <div className="glass-card user-info-card" style={{ flexDirection: 'column', textAlign: 'center' }}>
                    <div className="avatar-lg bg-blue-soft" style={{ fontSize: '40px' }}>
                        {activeAvatar}
                    </div>
                    <div className="user-details">
                        <h3 className="profile-name">{username}</h3>
                        <p className="profile-joined">Bergabung sejak {joinedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-green-soft">
                            <CalendarDays size={20} className="icon-green" />
                        </div>
                        <div className="stat-value">{daysJoined} Hari</div>
                        <div className="stat-label">Bersama MOODIFY</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-orange-soft">
                            <Award size={20} className="icon-orange" />
                        </div>
                        <div className="stat-value">{userData.streak || 0} Hari</div>
                        <div className="stat-label">Streak Check-in</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-blue-soft">
                            <Clock size={20} className="icon-blue" />
                        </div>
                        <div className="stat-value">{userData.totalSessions || 0}</div>
                        <div className="stat-label">Sesi Selesai</div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="settings-section">
                    <h3 className="section-title">
                        <Award size={18} />
                        Pencapaian Kamu
                    </h3>
                    <div className="glass-card settings-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '16px', textAlign: 'center' }}>
                            {/* First Check-in Badge */}
                            <div style={{ opacity: userData.history?.length > 0 ? 1 : 0.4, filter: userData.history?.length > 0 ? 'none' : 'grayscale(100%)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌱</div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Langkah Awal</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Check-in pertama</div>
                            </div>
                            
                            {/* 3 Days Streak Badge */}
                            <div style={{ opacity: userData.streak >= 3 ? 1 : 0.4, filter: userData.streak >= 3 ? 'none' : 'grayscale(100%)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Konsisten</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>3 hari streak</div>
                            </div>

                            {/* Chat Badge */}
                            <div style={{ opacity: userData.totalSessions >= 5 ? 1 : 0.4, filter: userData.totalSessions >= 5 ? 'none' : 'grayscale(100%)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Suka Cerita</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>5 sesi chat</div>
                            </div>

                            {/* Veteran Badge */}
                            <div style={{ opacity: daysJoined >= 7 ? 1 : 0.4, filter: daysJoined >= 7 ? 'none' : 'grayscale(100%)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Setia</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>7 hari bersama</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="section-title">
                        <Palette size={18} />
                        Personalisasi
                    </h3>
                    
                    <div className="glass-card settings-card" style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#1e293b' }}>Pilih Tema Warna</h4>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {THEMES.map(theme => (
                                    <button 
                                        key={theme.id}
                                        onClick={() => handleThemeChange(theme.id)}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            backgroundColor: theme.color,
                                            border: activeTheme === theme.id ? '3px solid #1e293b' : '2px solid transparent',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            boxShadow: activeTheme === theme.id ? '0 0 0 2px white inset' : 'none'
                                        }}
                                        title={theme.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="setting-divider" style={{ margin: '0 0 20px 0' }}></div>

                        <div>
                            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#1e293b' }}>Pilih Avatar</h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {AVATARS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleAvatarChange(emoji)}
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            fontSize: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            backgroundColor: activeAvatar === emoji ? 'var(--primary-surface)' : '#f1f5f9',
                                            border: activeAvatar === emoji ? '2px solid var(--primary)' : '2px solid transparent',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="section-title">
                        <Settings size={18} />
                        Pengaturan Aplikasi
                    </h3>
                    
                    <div className="glass-card settings-card">
                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon bg-blue-soft"><Bell size={18} className="icon-blue"/></div>
                                <div>
                                    <h4>Notifikasi Pengingat</h4>
                                    <p>Ingatkan saya untuk check-in dan minum air</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.notifications} onChange={() => toggleSetting('notifications')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="setting-divider"></div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon bg-purple-soft"><Moon size={18} className="icon-purple"/></div>
                                <div>
                                    <h4>Dark Mode (Segera Hadir)</h4>
                                    <p>Ubah tampilan menjadi mode gelap</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" disabled />
                                <span className="slider round disabled"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <button 
                    className="btn-logout hover-lift" 
                    onClick={() => setShowLogoutConfirm(true)}
                >
                    <LogOut size={18} />
                    Keluar Akun
                </button>

                {/* Overlay Detail Modal for Logout Confirm */}
                {showLogoutConfirm && (
                    <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
                        <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Keluar Akun?</h3>
                            <p style={{ marginBottom: '24px', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                                Apakah kamu yakin ingin keluar dari {username}? Data check-in dan jurnalmu tetap tersimpan di perangkat ini.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>Batal</button>
                                <button className="btn-danger" style={{ flex: 1 }} onClick={handleLogout}>Ya, Keluar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
