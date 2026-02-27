import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
        setMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🚗</span>
                    <span className="gradient-text font-display">Trekunity</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="navbar-links hide-mobile">
                    <Link to="/trips" className={`nav-link ${isActive('/trips') ? 'active' : ''}`}>Explore Trips</Link>
                    <Link to="/rides" className={`nav-link ${isActive('/rides') ? 'active' : ''}`}>Book a Ride</Link>
                    <Link to="/rentals" className={`nav-link ${isActive('/rentals') ? 'active' : ''}`}>Rent a Car</Link>
                    {user && (
                        <Link to="/host" className={`nav-link ${isActive('/host') ? 'active' : ''}`}>Host a Vehicle</Link>
                    )}
                    {user && (
                        <Link to="/trips/create" className={`nav-link ${isActive('/trips/create') ? 'active' : ''}`}>
                            + New Trip
                        </Link>
                    )}
                    {user?.role === 'ADMIN' && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
                    )}
                </nav>

                {/* Auth actions */}
                <div className="navbar-actions hide-mobile">
                    {user ? (
                        <div className="user-menu">
                            <Link to={`/profile/${user.id}`} className="user-avatar-btn">
                                {user.avatarUrl
                                    ? <img src={user.avatarUrl} alt={user.name} className="avatar avatar-sm" />
                                    : <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.8rem' }}>{user.name[0].toUpperCase()}</div>
                                }
                                <span>{user.name}</span>
                            </Link>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <span></span><span></span><span></span>
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/trips" onClick={() => setMenuOpen(false)} className="mobile-link">Explore Trips</Link>
                    <Link to="/rides" onClick={() => setMenuOpen(false)} className="mobile-link">Book a Ride</Link>
                    <Link to="/rentals" onClick={() => setMenuOpen(false)} className="mobile-link">Rent a Car</Link>
                    {user && <Link to="/host" onClick={() => setMenuOpen(false)} className="mobile-link">Host a Vehicle</Link>}
                    {user && <Link to="/trips/create" onClick={() => setMenuOpen(false)} className="mobile-link">+ New Trip</Link>}
                    {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="mobile-link">Admin</Link>}
                    {user
                        ? <>
                            <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="mobile-link">My Profile</Link>
                            <button onClick={handleLogout} className="mobile-link" style={{ textAlign: 'left', color: 'var(--clr-danger)' }}>Logout</button>
                        </>
                        : <>
                            <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-link">Log in</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)} className="mobile-link">Sign up</Link>
                        </>
                    }
                </div>
            )}
        </header>
    );
}
