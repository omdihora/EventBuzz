import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVolunteerRoles } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VolunteerApplyModal from '../components/VolunteerApplyModal';
import EmberCanvas from '../components/EmberCanvas';

export default function Volunteer() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const res = await getVolunteerRoles();
            setRoles(res.data.roles || []);
        } catch (err) {
            console.error('Failed to load volunteer roles', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (role) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedRole(role);
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--th-bg)' }}>
            <section className="relative min-h-[50vh] flex items-center px-4 overflow-hidden" style={{ background: 'var(--th-hero-grad)', borderBottom: '1px solid var(--th-border)' }}>
                {/* Background EmberCanvas */}
                <EmberCanvas className="absolute inset-0 z-0 opacity-80 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--th-bg)]/50 to-[var(--th-bg)] z-0"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0 mix-blend-overlay"></div>

                <div className="max-w-7xl mx-auto w-full z-10 relative flex flex-col items-center text-center py-20">
                    <span className="badge badge-ember mb-6 px-4 py-1.5 text-xs font-bold tracking-widest uppercase animate-[fade-in-up_0.6s_ease-out_forwards] shadow-[0_0_20px_rgba(232,114,92,0.4)]">Earn While You Learn</span>
                    <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6 animate-[fade-in-up_0.6s_ease-out_0.1s_forwards]" style={{ color: 'var(--th-charcoal)', textShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        Shape the <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember via-amber-500 to-frost px-2">Experience</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl animate-[fade-in-up_0.6s_ease-out_0.2s_forwards] font-medium leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                        Join the elite crew behind the best campus events. Gain premium experience, build your network, and earn cash for your hard work! Keep the gears turning.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--th-charcoal)' }}>
                        <span className="text-ember text-4xl">⚡</span> Open Opportunities
                    </h2>
                    <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-text-muted bg-[var(--th-surface)] px-4 py-2 rounded-full border border-[var(--th-border)] shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {roles.length} Roles Active
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="w-16 h-16 border-4 border-ember/30 border-t-ember rounded-full animate-spin"></div>
                    </div>
                ) : roles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {roles.map((role, idx) => (
                            <div
                                key={role.id}
                                className="relative group rounded-3xl p-[1px] overflow-hidden"
                                style={{
                                    animationDelay: `${idx * 0.15}s`,
                                    animationFillMode: 'both',
                                    animationName: 'fade-in-up',
                                    animationDuration: '0.6s'
                                }}
                            >
                                {/* Animated Gradient Border */}
                                <div className="absolute inset-0 bg-gradient-to-br from-ember/30 via-[var(--th-border)] to-frost/30 opacity-70 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-ember via-amber-500 to-frost opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 z-0 group-hover:duration-200"></div>

                                {/* Card Content */}
                                <div className="relative h-full bg-[var(--th-surface)] backdrop-blur-2xl rounded-3xl p-8 flex flex-col z-10 transition-transform duration-300 group-hover:scale-[0.99]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}>

                                    {/* Abstract glow inside card */}
                                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-bl from-ember/10 to-frost/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 rotate-45 -z-10 mix-blend-screen"></div>

                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-frost mb-1">{role.organizerClub || 'Campus Event'}</span>
                                            <h3 className="text-2xl font-black leading-tight group-hover:text-ember transition-colors duration-300" style={{ color: 'var(--th-charcoal)' }}>{role.roleTitle}</h3>
                                        </div>
                                        <div className="flex bg-gradient-to-br from-surface to-[var(--th-bg)] p-3 rounded-2xl shadow-inner border border-[var(--th-border)]">
                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-ember to-amber-500">
                                                <span className="text-lg mr-0.5">₹</span>{role.paymentAmount}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm mb-8 leading-relaxed flex-1 opacity-80" style={{ color: 'var(--th-text-secondary)' }}>{role.description}</p>

                                    {/* Event Details Ribbon */}
                                    <div className="relative bg-[var(--th-bg)] p-4 rounded-2xl border border-[var(--th-border)] mb-8 overflow-hidden group-hover:border-ember/20 transition-colors duration-300">
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-ember to-frost opacity-50"></div>
                                        <div className="space-y-2 text-sm font-medium" style={{ color: 'var(--th-text)' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-[var(--th-surface)] shadow-sm flex items-center justify-center text-frost"><span className="text-xs">📅</span></div>
                                                <span className="opacity-90">{new Date(role.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-[var(--th-surface)] shadow-sm flex items-center justify-center text-ember"><span className="text-xs">🎪</span></div>
                                                <span className="truncate opacity-90" title={role.eventTitle}>{role.eventTitle}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-[var(--th-surface)] shadow-sm flex items-center justify-center text-amber-500"><span className="text-xs">📍</span></div>
                                                <span className="truncate opacity-90" title={role.eventVenue}>{role.eventVenue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted mb-1">Availability</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-0.5">
                                                    {Array.from({ length: Math.min(role.positionsAvailable, 10) }).map((_, i) => (
                                                        <div key={i} className={`w-1.5 h-4 rounded-full ${i < role.positionsFilled ? 'bg-ember/50' : 'bg-[var(--th-border)]'}`}></div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold" style={{ color: 'var(--th-charcoal)' }}>{role.positionsAvailable - role.positionsFilled} left</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApplyClick(role)}
                                            disabled={role.positionsFilled >= role.positionsAvailable}
                                            className={`relative overflow-hidden px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 transform active:scale-95 ${role.positionsFilled >= role.positionsAvailable
                                                ? 'bg-[var(--th-bg)] text-text-muted cursor-not-allowed border border-[var(--th-border)]'
                                                : 'bg-gradient-to-r from-ember to-amber-500 text-white shadow-lg shadow-ember/20 hover:shadow-ember/50 hover:-translate-y-1'
                                                }`}
                                        >
                                            {!(role.positionsFilled >= role.positionsAvailable) && (
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0 blur-md"></div>
                                            )}
                                            <div className="relative z-10 flex items-center gap-2">
                                                {role.positionsFilled >= role.positionsAvailable ? (
                                                    <><span>🔒</span> Full</>
                                                ) : (
                                                    <><span>✨</span> Apply Now</>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 px-4 bg-[var(--th-surface)] border border-[var(--th-border)] rounded-3xl max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                        <div className="relative z-10">
                            <div className="text-7xl mb-6">🙌</div>
                            <h3 className="text-3xl font-black mb-3" style={{ color: 'var(--th-charcoal)' }}>No Opportunities Currently</h3>
                            <p className="text-lg opacity-80" style={{ color: 'var(--th-text-secondary)' }}>Our events team is cooking up something big. Check back later for new roles!</p>
                        </div>
                    </div>
                )}
            </div>

            {selectedRole && (
                <VolunteerApplyModal
                    role={selectedRole}
                    event={{ id: selectedRole.eventId, title: selectedRole.eventTitle, date: new Date(selectedRole.eventDate).toLocaleDateString(), fee: selectedRole.paymentAmount }}
                    onClose={() => setSelectedRole(null)}
                />
            )}
        </div>
    );
}
