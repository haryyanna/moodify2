import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="desktop-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>MOODIFY</h3>
                    <p>Pendamping Mental Sehat, Berbasis AI untuk mendukung keseharianmu.</p>
                </div>
                <div className="footer-section">
                    <h4>Tautan Cepat</h4>
                    <ul>
                        <li><Link to="/home">Beranda</Link></li>
                        <li><Link to="/chat">Chat AI</Link></li>
                        <li><Link to="/journal">Jurnal</Link></li>
                        <li><Link to="/education">Edukasi</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Bantuan & Info</h4>
                    <ul>
                        <li><a href="#">Tentang Kami</a></li>
                        <li><a href="#">Kebijakan Privasi</a></li>
                        <li><a href="#">Syarat & Ketentuan</a></li>
                        <li><a href="#">Kontak Bantuan</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} MOODIFY. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
