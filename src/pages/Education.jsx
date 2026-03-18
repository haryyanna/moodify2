import { ArrowLeft, BookOpen, Brain, Moon, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Education.css';

const Education = () => {
    const navigate = useNavigate();

    const articles = [
        {
            icon: <ShieldAlert size={28} className="icon-red" />,
            title: "Apa Itu Stres?",
            desc: "Stres adalah respons alami tubuh saat menghadapi tekanan atau ancaman. Kenali tanda-tandanya.",
            color: "red-card",
            content: "Gejala stres bisa berupa jantung berdebar, otot tegang, atau sulit tidur. Cara atasinya: istirahat cukup, cerita ke teman, dan lakukan hobi yang menyenangkan."
        },
        {
            icon: <Brain size={28} className="icon-orange" />,
            title: "Memahami Anxiety (Cemas)",
            desc: "Rasa cemas yang berlebihan hingga mengganggu aktivitas harian.",
            color: "orange-card",
            content: "Kecemasan sering kali membesarkan masalah di kepala kita. Coba latihan napas 4-4-6 untuk menurunkan denyut jantung dan fokus pada hal yang bisa kamu kontrol."
        },
        {
            icon: <BookOpen size={28} className="icon-blue" />,
            title: "Mengatasi Overthinking",
            desc: "Terus memikirkan hal yang sama berulang-ulang tanpa solusi.",
            color: "blue-card",
            content: "Beri batasan waktu untuk berpikir (misal: 15 menit), lalu alihkan perhatian. Tuliskan pikiranmu di Jurnal agar kepalamu terasa lebih lega."
        },
        {
            icon: <Moon size={28} className="icon-purple" />,
            title: "Cara Tidur Lebih Baik",
            desc: "Tips sleep hygiene untuk kualitas tidur yang optimal dan pikiran segar.",
            color: "purple-card",
            content: "Jauhi layar HP 1 jam sebelum tidur. Redupkan lampu, hindari kafein di sore hari, dan usahakan tidur serta bangun di jam yang sama setiap hari."
        }
    ];

    return (
        <div className="education-container animate-fade-in">
            <header className="page-header">
                <button className="icon-btn-rounded" onClick={() => navigate('/home')}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Edukasi Mental</h2>
                <div style={{ width: 40 }} />
            </header>

            <div className="education-content">
                <div className="edu-banner">
                    <h3>Pahami Dirimu Lebih Baik</h3>
                    <p>Pengetahuan adalah langkah pertama menuju kesehatan mental yang lebih stabil.</p>
                </div>

                <div className="articles-grid">
                    {articles.map((art, idx) => (
                        <div key={idx} className={`article-card ${art.color} glass-card`}>
                            <div className="article-header">
                                <div className="article-icon-wrap">
                                    {art.icon}
                                </div>
                                <h4>{art.title}</h4>
                            </div>
                            <p className="article-desc">{art.desc}</p>
                            <div className="article-hide-content">
                                <hr />
                                <p>{art.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Education;
