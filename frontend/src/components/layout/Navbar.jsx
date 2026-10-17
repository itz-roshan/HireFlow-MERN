import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, MessageCircle, UserCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import Avatar from '../ui/Avatar';
export default function Navbar() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const nav = useNavigate();
    const profilePath = user?.role === 'JOB_SEEKER' ? '/profile' : '/account';
    return (<header className="navbar">
        <div className="container nav-inner">
            <Link className="brand" to="/">
                <span className="brand-mark">H</span>
                <span>Hire<span>Flow</span>
    </span>
            </Link>
            <button className="mobile-toggle" aria-label="Toggle menu" onClick={() => setOpen(x => !x)}>
                {open ? <X /> : <Menu />}
            </button>
            <nav className={`nav-links ${open ? 'open' : ''}`}>
                <NavLink to="/jobs" onClick={() => setOpen(false)}>Jobs</NavLink>
                <NavLink to="/companies" onClick={() => setOpen(false)}>Companies</NavLink>
                <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
                <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
                {user ? <>
                    <NavLink to="/dashboard" onClick={() => setOpen(false)}><LayoutDashboard size={16}/>Dashboard</NavLink>
                    {(user.role === 'JOB_SEEKER' || user.role === 'RECRUITER') && (
                        <NavLink to="/messages" onClick={() => setOpen(false)}>
                            <MessageCircle size={16}/>
                            Messages
                        </NavLink>
                    )}
                    <NotificationBell />
                    <button className="nav-user" onClick={() => {
                            nav(profilePath);
                            setOpen(false);
                        }}>
                        <Avatar src={user.avatar} name={user.name} size="sm"/>
                        <span>
                            {user.name.split(' ')[0]}
                        </span>
                        <UserCircle size={16}/>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={16}/>Logout</button>
                </> : <>
                    <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                    <Link className="btn btn-primary btn-sm nav-cta" to="/register" onClick={() => setOpen(false)}>Get Started</Link>
                </>}
            </nav>
        </div>
    </header>);
}
