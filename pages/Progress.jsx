import { useState, useEffect } from 'react';
import { Flame, Calendar, Info, Award, TrendingDown, Target, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Progress.css';

const DEFAULT_DATA = [
    { name: 'Min', depresi: 0, kecemasan: 0, stres: 0 },
    { name: 'Sen', depresi: 0, kecemasan: 0, stres: 0 },
    { name: 'Sel', depresi: 0, kecemasan: 0, stres: 0 },
    { name: 'Rab', depresi: 0, kecemasan: 0, stres: 0 },
    { name: 'Kam', depresi: 0, kecemasan: 0, stres: 0 },
    { name: 'Jum', depresi: 0, kecemasan: 0, stres: 0 },
    { name: 'Sab', depresi: 0, kecemasan: 0, stres: 0 }
];

const MOOD_DATA_MAP = {
    1: { text: "Sangat Sedih", emoji: "😭" },
    2: { text: "Sedih", emoji: "😔" },
    3: { text: "Biasa Saja", emoji: "😐" },
    4: { text: "Senang", emoji: "🙂" },
    5: { text: "Sangat Senang", emoji: "😄" }
};

const Progress = () => {
    const [hasData, setHasData] = useState(false);
    const [chartData, setChartData] = useState(DEFAULT_DATA);
    const [stats, setStats] = useState({
        streak: 0,
        sessions: 0,
        moodText: "Belum ada data",
        moodEmoji: "❓",
        level: "🌱 Beginner",
        stability: "0%",
        stressTrend: "Stabil",
        activities: 0
    });

    useEffect(() => {
        const username = localStorage.getItem('moodify_currentUser');
        if (!username) return;

        const userKey = `moodify_data_${username}`;
        try {
            const savedData = localStorage.getItem(userKey);
            if (savedData) {
                const userData = JSON.parse(savedData);
                
                // Initialize chart data with defaults
                let newChartData = [...DEFAULT_DATA];

                if (userData.hasCheckedIn || (userData.history && userData.history.length > 0)) {
                    setHasData(true);

                    // Get saved mood
                    const moodInfo = MOOD_DATA_MAP[userData.lastMood] || { text: "Kurang Baik", emoji: "😀" };

                    // Parse history into chart data
                    if (userData.history && userData.history.length > 0) {
                        const historyData = userData.history.slice(-7); // Get up to last 7 days Max
                        
                        // Overwrite DEFAULT_DATA from the end backwards
                        const startIndex = Math.max(0, 7 - historyData.length);
                        
                        for (let i = 0; i < historyData.length; i++) {
                            const entry = historyData[i];
                            const dateObj = new Date(entry.date);
                            const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                            const dayName = dayNames[dateObj.getDay()];

                            newChartData[startIndex + i] = {
                                name: dayName,
                                depresi: Math.max(0, entry.sliders?.sadness || 0),
                                kecemasan: Math.max(0, entry.sliders?.anxiety || 0),
                                stres: Math.max(0, entry.sliders?.stress || 0)
                            };
                        }
                    }

                    // Level Calculation
                    let currentLevel = "🌱 Beginner";
                    const totalSesh = userData.totalSessions || 0;
                    if (totalSesh >= 21) currentLevel = "🌳 Balanced Mind";
                    else if (totalSesh >= 7) currentLevel = "🌿 Growing";

                    // Calculate stats from history
                    let stabilityPercentage = "85%";
                    let stressTrendText = "Stabil";
                    let actsCompleted = 0;

                    if (userData.history && userData.history.length > 0) {
                        const history = userData.history;
                        
                        // Count completed activities
                        history.forEach(item => {
                            if (item.dailyCompleted) actsCompleted += item.dailyCompleted;
                        });

                        if (history.length >= 2) {
                            const lastStress = history[history.length - 1].sliders?.stress || 0;
                            const prevStress = history[history.length - 2].sliders?.stress || 0;
                            if (lastStress < prevStress) stressTrendText = "Menurun";
                            else if (lastStress > prevStress) stressTrendText = "Meningkat";
                            
                            // Simple stability mock based on mood variance
                            let moodSum = 0;
                            history.slice(-7).forEach(h => moodSum += h.mood);
                            const moodAvg = moodSum / Math.min(7, history.length);
                            let variance = 0;
                            history.slice(-7).forEach(h => variance += Math.pow(h.mood - moodAvg, 2));
                            const finalVariance = variance / Math.min(7, history.length);
                            const stabValue = Math.max(40, Math.round(100 - (finalVariance * 15)));
                            stabilityPercentage = `${stabValue}%`;
                        } else {
                            stabilityPercentage = "100%"; // Only 1 data point is stable
                        }
                    }

                    // Set state
                    setChartData(newChartData);
                    setStats({
                        streak: userData.streak || 0,
                        sessions: totalSesh,
                        moodText: moodInfo.text,
                        moodEmoji: moodInfo.emoji,
                        level: currentLevel,
                        stability: stabilityPercentage,
                        stressTrend: stressTrendText,
                        activities: actsCompleted
                    });
                } else {
                    // No history but they might just be empty
                    setChartData(newChartData);
                }
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    }, []);

    const clearData = () => {
        const username = localStorage.getItem('moodify_currentUser');
        if (!username) return;

        const userKey = `moodify_data_${username}`;
        try {
            const savedData = localStorage.getItem(userKey);
            if (savedData) {
                const userData = JSON.parse(savedData);
                userData.hasCheckedIn = false;
                userData.lastMood = null;
                userData.lastSliders = null;
                // keep streak and totalSessions or clear them? The requirement says reset chart.
                // let's just reset everything for demo purposes
                userData.streak = 0;
                userData.totalSessions = 0;
                localStorage.setItem(userKey, JSON.stringify(userData));
            }
        } catch (e) { }

        setHasData(false);
        setChartData(DEFAULT_DATA);
        setStats({ streak: 0, sessions: 0, moodText: "Belum ada data", moodEmoji: "❓", level: "🌱 Beginner", stability: "0%", stressTrend: "Stabil", activities: 0 });
    };

    return (
        <div className="progress-container animate-fade-in">
            {/* Header with Logo */}
            <div className="checkin-top-brand">
                <div className="brand-logo">🤖</div>
                <div className="brand-text">MOODIFY</div>
            </div>

            {/* Header */}
            <div className="progress-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Perkembanganmu</h1>
                    {hasData && (
                        <button onClick={clearData} className="btn-link" style={{ color: '#64748b', fontSize: '12px' }}>Reset</button>
                    )}
                </div>
                <p>
                    {hasData
                        ? "Kamu sudah berjuang dengan sangat baik!"
                        : "Mulai perjalananmu dengan Check-in hari ini."}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card orange-card">
                    <div className="stat-icon-wrapper orange-icon">
                        <Flame size={20} color="#ea580c" />
                    </div>
                    <h2 className="stat-number">{stats.streak}</h2>
                    <span className="stat-label">HARI BERUNTUN</span>
                </div>

                <div className="stat-card blue-card">
                    <div className="stat-icon-wrapper blue-icon">
                        <Calendar size={20} color="#2563eb" />
                    </div>
                    <h2 className="stat-number">{stats.sessions}</h2>
                    <span className="stat-label">TOTAL SESI</span>
                </div>
            </div>

            {/* Gamification Level */}
            <div className="glass-card level-card" style={{ padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
                <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534', letterSpacing: '0.5px' }}>LEVEL PENGGUNA</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#14532d', marginTop: '4px' }}>{stats.level}</h3>
                </div>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.15)' }}>
                    <Award size={32} color="#15803d" />
                </div>
            </div>

            {/* Detailed Progress Dashboard */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                    <Target size={18} color="#6366f1" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>STABILITAS MOOD</span>
                    <strong style={{ fontSize: '18px', color: '#334155' }}>{stats.stability}</strong>
                </div>
                <div className="glass-card" style={{ padding: '16px' }}>
                    <TrendingDown size={18} color={stats.stressTrend === 'Menurun' ? '#22c55e' : '#ef4444'} style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>LEVEL STRES</span>
                    <strong style={{ fontSize: '18px', color: '#334155' }}>{stats.stressTrend}</strong>
                </div>
                <div className="glass-card" style={{ padding: '16px', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>AKTIVITAS SELESAI</span>
                        <strong style={{ fontSize: '18px', color: '#334155' }}>{stats.activities} Tantangan</strong>
                    </div>
                    <Zap size={24} color="#f59e0b" fill="#fcd34d" />
                </div>
            </div>

            {/* Average Mood */}
            <div className="glass-card avg-mood-card">
                <div className="avg-mood-text">
                    <span className="avg-mood-label">MOOD RATA-RATA</span>
                    <h3 className="avg-mood-value">{stats.moodText}</h3>
                </div>
                <div className="avg-mood-emoji">
                    <span>{stats.moodEmoji}</span>
                </div>
            </div>

            {/* Chart Section */}
            <div className="glass-card chart-card">
                <h3>Grafik DASS-21 Mingguan</h3>
                <div className="chart-wrapper" style={{ position: 'relative' }}>

                    {!hasData && (
                        <div className="empty-chart-overlay">
                            <Info size={24} color="#94a3b8" />
                            <p>Belum ada data check-in</p>
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDepresi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorKecemasan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorStres" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [Math.round(value), undefined]}
                            />
                            <Area type="monotone" dataKey="depresi" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDepresi)" />
                            <Area type="monotone" dataKey="kecemasan" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorKecemasan)" />
                            <Area type="monotone" dataKey="stres" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorStres)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

            {/* Custom Legend */}
            <div className="custom-legend">
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#2563eb' }}></span>
                    <span className="legend-text">Depresi</span>
                    <span className="legend-status">{stats.stressTrend}</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ea580c' }}></span>
                    <span className="legend-text">Kecemasan</span>
                    <span className="legend-status">{stats.stressTrend}</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#dc2626' }}></span>
                    <span className="legend-text">Stres</span>
                    <span className="legend-status">{stats.stressTrend}</span>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Progress;
