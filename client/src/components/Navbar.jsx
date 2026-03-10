import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const handleLogout = () => { const isAdmin = user?.role === 'Admin'; logout(); navigate(isAdmin ? '/admin-login' : '/'); };
    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, children }) => (
        <Link to={to} className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(to) ? 'text-ember' : 'hover:text-ember'}`} style={{ backgroundColor: isActive(to) ? 'var(--color-ember-50)' : 'transparent', color: isActive(to) ? undefined : 'var(--th-text-secondary)' }}>
            {children}
            {isActive(to) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-ember rounded-full"></span>}
        </Link>
    );

    return (
        <nav className="sticky top-0 z-40" style={{ background: 'var(--th-nav-bg)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--th-nav-border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-ember to-ember-dark rounded-xl flex items-center justify-center shadow-lg shadow-ember/20 group-hover:shadow-ember/30 transition-shadow duration-300">
                            <span className="text-white font-extrabold text-base">E</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--th-charcoal)' }}>Event<span className="text-ember">Buzz</span></span>
                    </Link>
                    <div className="hidden md:flex items-center gap-0.5">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/events">Events</NavLink>
                        <NavLink to="/clubs">Clubs</NavLink>
                        <NavLink to="/volunteer">Volunteer</NavLink>
                        <NavLink to="/gallery">Gallery</NavLink>
                        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
                        {user?.role === 'Admin' && <NavLink to="/admin-dashboard">Admin Panel</NavLink>}
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                            style={{ background: 'var(--th-surface)', border: '1px solid var(--th-border)' }}
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? (
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--th-text-secondary)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                            ) : (
                                <svg className="w-4.5 h-4.5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            )}
                        </button>
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl" style={{ background: 'var(--color-ember-50)', border: '1px solid rgba(232,114,92,0.1)' }}>
                                    <div className="w-7 h-7 bg-gradient-to-br from-ember to-ember-dark rounded-lg flex items-center justify-center shadow-sm"><span className="text-white font-bold text-xs">{user.name?.charAt(0).toUpperCase()}</span></div>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--th-charcoal)' }}>{user.name}</span>
                                    <span className="badge badge-info !text-[0.6rem] !py-0.5">{user.role}</span>
                                </div>
                                <button onClick={handleLogout} className="px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:text-ember" style={{ color: 'var(--th-text-muted)' }}>Logout</button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{ color: 'var(--th-text-secondary)' }}>Login</Link>
                                <Link to="/register" className="btn-primary text-sm !py-2 !px-6 !rounded-xl">Sign Up</Link>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:hidden">
                        {/* Mobile theme toggle */}
                        <button onClick={toggleTheme} className="p-2 rounded-xl" style={{ color: 'var(--th-text-secondary)' }}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--th-text-secondary)' }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className="md:hidden pb-4 mt-2 pt-3 space-y-1 reveal" style={{ borderTop: '1px solid var(--th-border-light)' }}>
                        {[['/', 'Home'], ['/events', 'Events'], ['/clubs', 'Clubs'], ['/gallery', 'Gallery']].map(([p, l]) => <Link key={p} to={p} onClick={() => setMenuOpen(false)} className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(p) ? 'text-ember' : ''}`} style={{ backgroundColor: isActive(p) ? 'var(--color-ember-50)' : 'transparent', color: isActive(p) ? undefined : 'var(--th-text-secondary)' }}>{l}</Link>)}
                        {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>Dashboard</Link>}
                        {user?.role === 'Admin' && <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>Admin Panel</Link>}
                        <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--th-border-light)' }}>
                            {user ? <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-ember">Logout</button>
                                : <><Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>Login</Link><Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ember">Sign Up →</Link></>}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
