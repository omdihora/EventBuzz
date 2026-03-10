import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import RegistrationModal from '../components/RegistrationModal';
import Hyperspeed from '../components/Hyperspeed';
import { useTheme } from '../context/ThemeContext';

function AnimatedCounter({ end, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started) { setStarted(true); }
        }, { threshold: 0.3 });
        const el = document.getElementById('stats-section');
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [started]);
    useEffect(() => {
        if (!started) return;
        const duration = 2000; const startTime = Date.now();
        const step = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, end]);
    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => { getEvents().then(r => setEvents(r.data.events)).catch(console.error).finally(() => setLoading(false)); }, []);
    const refreshEvents = () => { getEvents().then(r => setEvents(r.data.events)).catch(console.error); };

    const hyperspeedOptions = useMemo(() => ({
        onSpeedUp: () => { },
        onSlowDown: () => { },
        distortion: 'mountainDistortion',
        length: 400,
        roadWidth: 9,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 90,
        fovSpeedUp: 150,
        speedUp: 2,
        carLightsFade: 0.4,
        totalSideLightSticks: 50,
        lightPairsPerRoadWay: 50,
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,
        lightStickWidth: [0.12, 0.5],
        lightStickHeight: [1.3, 1.7],
        movingAwaySpeed: [60, 80],
        movingCloserSpeed: [-120, -160],
        carLightsLength: [400 * 0.05, 400 * 0.15],
        carLightsRadius: [0.05, 0.14],
        carWidthPercentage: [0.3, 0.5],
        carShiftX: [-0.2, 0.2],
        carFloorSeparation: [0.05, 1],
        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
            leftCars: [0xff102a, 0xeb383e, 0xff102a],
            rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
            sticks: 0xdadafa
        }
    }), []);

    const features = [
        { icon: '🎫', title: 'Instant QR Tickets', desc: 'Register & get your QR ticket in seconds. No queues, no hassle.', gradient: 'from-ember to-ember-dark' },
        { icon: '🏛️', title: 'Club Ecosystem', desc: 'Explore 7+ active clubs, apply to join, and find your tribe.', gradient: 'from-frost to-frost-dark' },
        { icon: '💺', title: 'Live Seat Tracking', desc: 'Real-time availability so you never miss a sold-out event.', gradient: 'from-amber to-amber-dark' },
        { icon: '📱', title: 'Mobile Ready', desc: 'Beautiful on every device. Register on the go from anywhere.', gradient: 'from-ember-light to-ember' },
    ];

    const formatDate = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

    return (
        <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>

            {/* ═══════════════ HERO — Always dark (Hyperspeed WebGL) ═══════════════ */}
            <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: '#000' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden' }}>
                    <Hyperspeed effectOptions={hyperspeedOptions} />
                </div>
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.6) 100%)' }} />

                <div className="relative max-w-7xl mx-auto px-6 w-full" style={{ zIndex: 2, pointerEvents: 'none' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left — Hero text (always white on dark bg) */}
                        <div style={{ pointerEvents: 'auto' }}>
                            <div className="inline-flex items-center gap-2.5 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold mb-8" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#E8725C' }}>
                                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ember"></span></span>
                                🔥 Live Now — {events.length} Events Open
                            </div>
                            <h1 className="text-[3.5rem] lg:text-[5rem] font-black leading-[1.02] tracking-tight mb-7">
                                <span className="block text-white drop-shadow-lg">Your Campus,</span>
                                <span className="block animate-gradient drop-shadow-lg" style={{ backgroundImage: 'linear-gradient(135deg, #E8725C, #F0A043, #2EC4B6, #E8725C)', backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Your Events.
                                </span>
                            </h1>
                            <p className="text-lg lg:text-xl mb-10 max-w-lg leading-relaxed text-white/60">
                                Discover hackathons, fests, workshops & more. Register instantly, get your QR ticket, and never miss what's happening on campus.
                            </p>
                            <div className="flex flex-wrap gap-4 mb-12">
                                <Link to="/events" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #E8725C, #D4604F)', boxShadow: '0 8px 30px rgba(232,114,92,0.3)' }}>
                                    Browse Events →
                                </Link>
                                <Link to="/clubs" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-semibold transition-all text-base border border-white/20 text-white/90 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                                    Explore Clubs
                                </Link>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {['🧑‍💻', '👩‍🎨', '🧑‍🔬', '👩‍💼'].map((e, i) => (
                                        <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)' }}>{e}</div>
                                    ))}
                                </div>
                                <p className="text-sm text-white/40"><strong className="text-white/70">500+</strong> students already registered</p>
                            </div>
                        </div>

                        {/* Right — Floating preview cards (always dark glassmorphism) */}
                        <div className="hidden lg:block relative h-[520px]" style={{ pointerEvents: 'auto' }}>
                            <div className="absolute top-8 left-8 right-0 p-5 animate-float hover:!transform-none" style={{ animationDuration: '5s', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                                <div className="h-36 rounded-2xl bg-gradient-to-r from-ember to-amber mb-4 flex items-center justify-center overflow-hidden">
                                    <span className="text-[4rem] opacity-80">🚀</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">Tech Hackathon 2026</h3>
                                <p className="text-sm mt-1 text-white/40">Coding Club • Mar 15</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-ember font-extrabold text-lg">₹150</span>
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300">199 seats left</span>
                                </div>
                            </div>
                            <div className="absolute bottom-16 left-0 p-4 w-48 animate-float" style={{ animationDuration: '6s', animationDelay: '1s', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-frost to-frost-dark rounded-xl flex items-center justify-center text-white text-lg">🎫</div>
                                    <div><p className="text-xs font-bold text-white">QR Ticket</p><p className="text-[0.65rem] text-white/40">Scan at venue</p></div>
                                </div>
                                <div className="w-full h-20 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="grid grid-cols-5 grid-rows-5 gap-[2px]">
                                        {Array.from({ length: 25 }).map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: Math.random() > 0.4 ? 'rgba(255,255,255,0.6)' : 'transparent' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 right-4 p-3.5 w-56 animate-float" style={{ animationDuration: '7s', animationDelay: '2s', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-amber to-amber-dark rounded-xl flex items-center justify-center text-white">✅</div>
                                    <div><p className="text-xs font-bold text-white">Registration Confirmed!</p><p className="text-[0.65rem] text-white/40">AI Workshop • Apr 5</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave divider: transitions dark hero → page bg */}
                <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 3 }}>
                    <svg viewBox="0 0 1440 80" fill="none" className="w-full">
                        <path d="M0,40 C360,80 720,0 1080,45 C1260,60 1380,30 1440,35 L1440,80 L0,80 Z" fill="var(--th-bg)" fillOpacity="0.5" />
                        <path d="M0,55 C480,20 960,70 1440,50 L1440,80 L0,80 Z" fill="var(--th-bg)" />
                    </svg>
                </div>
            </section>

            {/* ═══════════════ STATS ═══════════════ */}
            <section id="stats-section" className="-mt-1" style={{ background: 'var(--th-bg)' }}>
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { val: events.length, label: 'Live Events', icon: '🎪', accent: 'text-ember' },
                            { val: 7, label: 'Active Clubs', icon: '🏛️', accent: 'text-frost' },
                            { val: events.reduce((s, e) => s + e.totalSeats, 0), label: 'Total Seats', icon: '💺', accent: 'text-amber' },
                            { val: 50, label: 'Starting From', icon: '💰', prefix: '₹', suffix: '+', accent: 'text-ember' },
                        ].map((s, i) => (
                            <div key={i} className="glass-card p-6 text-center group hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                                <span className="text-3xl mb-3 block">{s.icon}</span>
                                <p className={`text-4xl lg:text-5xl font-black ${s.accent}`}>
                                    <AnimatedCounter end={s.val} prefix={s.prefix || ''} suffix={s.suffix || ''} />
                                </p>
                                <p className="text-sm mt-2 font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FEATURES ═══════════════ */}
            <section className="py-20" style={{ background: 'var(--th-section-bg)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 text-ember rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: 'var(--color-ember-50, rgba(232,114,92,0.1))' }}>Why EventBuzz?</span>
                        <h2 className="text-3xl lg:text-5xl font-black" style={{ color: 'var(--th-charcoal)' }}>Everything you need,<br /><span className="text-ember">all in one place.</span></h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card p-7 text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-16 h-16 mx-auto mb-5 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--th-charcoal)' }}>{f.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ EVENTS GRID ═══════════════ */}
            <section className="py-20" style={{ background: 'var(--th-bg)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
                        <div>
                            <span className="inline-block px-4 py-1.5 text-frost rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: 'var(--color-frost-50, rgba(46,196,182,0.1))' }}>Don't miss out</span>
                            <h2 className="text-3xl lg:text-4xl font-black" style={{ color: 'var(--th-charcoal)' }}>Upcoming Events</h2>
                            <p className="mt-2" style={{ color: 'var(--th-text-secondary)' }}>Register before seats fill up!</p>
                        </div>
                        <Link to="/events" className="btn-outline text-sm">View All Events →</Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                            {events.map((e, i) => <EventCard key={e.id} event={e} onRegister={setSelectedEvent} index={i} />)}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════ CTA ═══════════════ */}
            <section className="relative overflow-hidden">
                <div className="py-24" style={{ background: 'linear-gradient(135deg, #E8725C 0%, #D4604F 40%, #2EC4B6 100%)' }}>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-10 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
                    <div className="relative max-w-3xl mx-auto px-6 text-center">
                        <span className="inline-block px-5 py-2 bg-white/15 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-8">✨ 100% Free to Register</span>
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-[1.1]">Ready to dive in?</h2>
                        <p className="text-lg text-white/70 mb-10 max-w-md mx-auto">Create your free account and start registering for campus events in seconds.</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-ember px-10 py-4.5 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                Get Started Free →
                            </Link>
                            <Link to="/events" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-semibold transition-all hover:bg-white/20">
                                Browse First
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer style={{ background: 'var(--th-footer-bg)' }}>
                <div className="max-w-7xl mx-auto px-6 py-14">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-ember to-amber rounded-xl flex items-center justify-center shadow-lg shadow-ember/20">
                                <span className="text-white font-extrabold text-lg">E</span>
                            </div>
                            <div>
                                <span className="text-white font-bold text-lg">Event<span className="text-ember">Buzz</span></span>
                                <p className="text-xs" style={{ color: 'var(--th-footer-text)' }}>College Event Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 text-sm">
                            {[['Events', '/events'], ['Clubs', '/clubs'], ['Login', '/login'], ['Register', '/register']].map(([label, path]) => (
                                <Link key={path} to={path} className="transition-colors hover:text-white" style={{ color: 'var(--th-footer-text)' }}>{label}</Link>
                            ))}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--th-footer-text)' }}>© 2026 EventBuzz. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {selectedEvent && <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onSuccess={refreshEvents} />}
        </div>
    );
}
