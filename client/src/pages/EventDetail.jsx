import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent } from '../services/api';
import RegistrationModal from '../components/RegistrationModal';
import { useAuth } from '../context/AuthContext';

const eventImages = {
    1: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
    2: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop',
    3: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    4: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop',
    5: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=600&fit=crop',
    6: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
    7: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&h=600&fit=crop',
    8: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=600&fit=crop',
};
const fallbackImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop';
const gradientOverlays = [
    'linear-gradient(135deg, rgba(232,114,92,0.6), rgba(240,160,67,0.5))',
    'linear-gradient(135deg, rgba(240,160,67,0.6), rgba(232,114,92,0.5))',
    'linear-gradient(135deg, rgba(46,196,182,0.6), rgba(37,169,157,0.5))',
    'linear-gradient(135deg, rgba(241,155,142,0.6), rgba(232,114,92,0.5))',
    'linear-gradient(135deg, rgba(232,114,92,0.5), rgba(46,196,182,0.5))',
    'linear-gradient(135deg, rgba(46,196,182,0.5), rgba(109,220,209,0.5))',
    'linear-gradient(135deg, rgba(245,194,126,0.6), rgba(240,160,67,0.5))',
    'linear-gradient(135deg, rgba(212,96,79,0.6), rgba(232,114,92,0.5))',
];
const icons = ['💻', '🚀', '🤖', '🎭', '🪩', '⌨️', '📸', '🧠'];

export default function EventDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { getEvent(id).then(r => setEvent(r.data.event)).catch(console.error).finally(() => setLoading(false)); }, [id]);
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const handleRegister = () => { if (!user) navigate('/login'); else setShowModal(true); };
    const refreshEvent = () => getEvent(id).then(r => setEvent(r.data.event)).catch(console.error);

    if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div></div>;
    if (!event) return <div className="page-container text-center py-20 reveal"><h2 className="text-2xl font-bold" style={{ color: 'var(--th-charcoal)' }}>Event not found</h2></div>;

    const icon = icons[(event.id - 1) % 8];
    const img = eventImages[event.id] || fallbackImage;
    const grad = gradientOverlays[(event.id - 1) % 8];
    const seatPct = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;

    return (
        <div className="page-container max-w-4xl">
            <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden mb-8 reveal group">
                {/* Background image with hover zoom */}
                <div className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                {/* Color gradient overlay */}
                <div className="absolute inset-0" style={{ background: grad }} />
                {/* Bottom dark fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out infinite' }} />
                {/* Floating icon */}
                <div className="absolute top-6 left-6 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {icon}
                </div>
                {/* Fee badge */}
                <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full text-base font-extrabold backdrop-blur-md shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                    {event.fee === 0 ? '✨ FREE' : `₹${event.fee}`}
                </div>
                {/* Title & club */}
                <div className="absolute bottom-7 left-7 right-7">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">{event.title}</h1>
                    {event.clubName && <Link to={`/club/${event.organizerClubId}`} className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mt-3 transition-colors backdrop-blur-sm px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>🏛️ Organized by <strong>{event.clubName}</strong></Link>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
                        <h2 className="text-lg font-bold text-charcoal mb-3">📝 About This Event</h2>
                        <p className="text-text-secondary leading-relaxed">{event.description}</p>
                    </div>
                    <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                        <h2 className="text-lg font-bold text-charcoal mb-5">📋 Event Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[['📅', 'Date', formatDate(event.date)], ['🕐', 'Time', `${event.startTime} – ${event.endTime}`], ['📍', 'Venue', event.venue], ['💰', 'Fee', event.fee === 0 ? 'Free!' : `₹${event.fee}`]].map(([ic, lb, vl]) =>
                                <div key={lb} className="flex items-start gap-3 p-4 bg-gradient-to-br from-sand to-surface rounded-xl border border-border-light">
                                    <span className="text-2xl">{ic}</span>
                                    <div><p className="text-[0.7rem] text-text-muted uppercase font-bold tracking-wider">{lb}</p><p className="font-bold text-charcoal mt-0.5">{vl}</p></div>
                                </div>)}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                        <h3 className="font-bold text-charcoal mb-4">💺 Seat Availability</h3>
                        <div className="text-center mb-5">
                            <p className="text-5xl font-extrabold text-ember">{event.availableSeats}</p>
                            <p className="text-sm text-text-muted mt-1">of {event.totalSeats} seats left</p>
                        </div>
                        <div className="w-full h-2.5 bg-sand rounded-full overflow-hidden mb-5">
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${seatPct > 80 ? 'bg-gradient-to-r from-ember to-ember-dark' : seatPct > 50 ? 'bg-gradient-to-r from-amber to-amber-dark' : 'bg-gradient-to-r from-frost to-frost-dark'}`} style={{ width: `${seatPct}%` }}></div>
                        </div>
                        <button onClick={handleRegister} disabled={event.availableSeats === 0} className="btn-primary w-full !py-3.5 text-base">{event.availableSeats === 0 ? '🚫 Sold Out' : '🎫 Register Now'}</button>
                    </div>
                </div>
            </div>
            {showModal && <RegistrationModal event={event} onClose={() => setShowModal(false)} onSuccess={refreshEvent} />}
        </div>
    );
}
