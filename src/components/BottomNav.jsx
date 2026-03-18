import { NavLink } from 'react-router-dom';
import { Home, MessageCircleHeart, Activity, BarChart2 } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/home"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <div className="icon-container">
                    <Home size={24} />
                </div>
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/chat"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <div className="icon-container">
                    <MessageCircleHeart size={24} />
                </div>
                <span>Chat</span>
            </NavLink>

            <NavLink
                to="/checkin"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <div className="icon-container center-icon">
                    <Activity size={28} color="white" />
                </div>
                <span>Check-in</span>
            </NavLink>

            <NavLink
                to="/progress"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <div className="icon-container">
                    <BarChart2 size={24} />
                </div>
                <span>Progres</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
