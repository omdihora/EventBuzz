import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../services/api';
import CircularGallery from '../components/CircularGallery';
import RegistrationModal from '../components/RegistrationModal';

/* Gradient images for each event — generated via picsum with unique seeds */
const eventImages = {
    1: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',  // Tech Hackathon
    2: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',  // Startup Pitch
    3: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',  // AI Workshop
    4: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',  // Cultural Fest
    5: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop',  // DJ Night
    6: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',  // Code Sprint
    7: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop',  // Photography
    8: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',  // Quiz Bowl
};

const fallbackImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getEvents()
            .then(r => setEvents(r.data.events))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const refreshEvents = () => {
        getEvents().then(r => setEvents(r.data.events)).catch(console.error);
    };

    /* Build gallery items from events */
    const galleryItems = events.map(e => ({
        image: eventImages[e.id] || fallbackImage,
        text: e.title,
    }));

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[80vh]">
                <div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
            {/* Hero with Circular Gallery */}
            <section className="relative" style={{ height: '75vh' }}>
                {/* Background gradient */}
                <div className="absolute inset-0" style={{ background: 'var(--th-hero-grad)' }}>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-ember/6 rounded-full blur-[100px] animate-blob" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-frost/6 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '3s' }} />
                </div>

                {/* Title overlay */}
                <div className="absolute top-6 left-0 right-0 z-10 text-center">
                    <span className="inline-block px-4 py-1.5 text-ember rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ background: 'var(--color-ember-50)' }}>
                        🔥 {events.length} Events Live
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-black" style={{ color: 'var(--th-charcoal)' }}>
                        Explore <span className="text-ember">Events</span>
                    </h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--th-text-muted)' }}>
                        Drag or scroll to browse • Click an event below to register
                    </p>
                </div>

                {/* Circular Gallery */}
                <div className="absolute inset-0 pt-28">
                    {galleryItems.length > 0 && (
                        <CircularGallery
                            items={galleryItems}
                            bend={1}
                            textColor="#ffffff"
                            borderRadius={0.05}
                            scrollSpeed={2}
                            scrollEase={0.05}
                            font="bold 24px Inter, sans-serif"
                        />
                    )}
                </div>
            </section>

            {/* Event Details Cards — Compact list below */}
            <section className="relative" style={{ background: 'var(--th-bg)' }}>
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="text-center mb-12 reveal">
                        <h2 className="text-3xl font-black" style={{ color: 'var(--th-charcoal)' }}>
                            Quick <span className="text-frost">Register</span>
                        </h2>
                        <p className="text-sm mt-2" style={{ color: 'var(--th-text-secondary)' }}>
                            Tap any event to register instantly
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {events.map((event, i) => {
                            const seatPct = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;
                            const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                            const gradients = [
                                'linear-gradient(135deg, #E8725C 0%, #F0A043 50%, #D4604F 100%)',
                                'linear-gradient(135deg, #2EC4B6 0%, #25A99D 50%, #6DDCD1 100%)',
                                'linear-gradient(135deg, #F0A043 0%, #E8725C 50%, #F5C27E 100%)',
                                'linear-gradient(135deg, #E8725C 0%, #2EC4B6 50%, #F0A043 100%)',
                                'linear-gradient(135deg, #6DDCD1 0%, #25A99D 50%, #2EC4B6 100%)',
                                'linear-gradient(135deg, #F19B8E 0%, #E8725C 50%, #D4604F 100%)',
                                'linear-gradient(135deg, #F5C27E 0%, #F0A043 50%, #D88C32 100%)',
                                'linear-gradient(135deg, #D4604F 0%, #E8725C 50%, #F0A043 100%)',
                            ];
                            const icons = ['💻', '🚀', '🤖', '🎭', '🪩', '⌨️', '📸', '🧠'];
                            const icon = icons[(event.id - 1) % icons.length];
                            const grad = gradients[(event.id - 1) % gradients.length];
                            const img = eventImages[event.id] || fallbackImage;
                            return (
                                <div key={event.id}
                                    className="glass-card overflow-hidden group cursor-pointer reveal"
                                    style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}
                                    onClick={() => navigate(`/event/${event.id}`)}
                                >
                                    {/* ── Animated Image Header ── */}
                                    <div className="relative h-44 overflow-hidden">
                                        {/* Background image with zoom on hover */}
                                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                                            style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0" style={{ background: `${grad}`, opacity: 0.55 }} />
                                        {/* Bottom fade for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                        {/* Shimmer sweep animation */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                                        {/* Floating icon */}
                                        <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                                            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                            {icon}
                                        </div>
                                        {/* Price tag */}
                                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-extrabold backdrop-blur-md"
                                            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                                            {event.fee === 0 ? 'FREE' : `₹${event.fee}`}
                                        </div>
                                        {/* Event title on image */}
                                        <div className="absolute bottom-3 left-4 right-4">
                                            <h3 className="text-white font-bold text-base drop-shadow-lg truncate">{event.title}</h3>
                                            {event.clubName && <p className="text-white/80 text-xs font-medium mt-0.5">🏛️ {event.clubName}</p>}
                                        </div>
                                    </div>

                                    {/* ── Card Body ── */}
                                    <div className="p-4">
                                        <div className="space-y-1.5 text-[0.78rem] mb-4" style={{ color: 'var(--th-text-secondary)' }}>
                                            <p className="flex items-center gap-2">📅 <span>{formatDate(event.date)}</span></p>
                                            <p className="flex items-center gap-2">🕐 <span>{event.startTime} – {event.endTime}</span></p>
                                            <p className="flex items-center gap-2 truncate">📍 <span>{event.venue}</span></p>
                                        </div>

                                        {/* Seat bar */}
                                        <div className="flex items-center justify-between text-[0.7rem] mb-1.5" style={{ color: 'var(--th-text-muted)' }}>
                                            <span>{event.availableSeats} seats left</span>
                                            <span>{Math.round(seatPct)}% filled</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
                                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${seatPct > 80 ? 'bg-gradient-to-r from-ember to-ember-dark' : seatPct > 50 ? 'bg-gradient-to-r from-amber to-amber-dark' : 'bg-gradient-to-r from-frost to-frost-dark'}`}
                                                style={{ width: `${seatPct}%` }} />
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                            disabled={event.availableSeats === 0}
                                            className="btn-primary w-full mt-4 text-sm !py-2.5 !rounded-xl"
                                        >
                                            {event.availableSeats === 0 ? '🚫 Sold Out' : '🎫 Register Now'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {events.length === 0 && (
                        <div className="text-center py-20 reveal">
                            <span className="text-5xl block mb-4">🔍</span>
                            <p className="text-lg font-medium" style={{ color: 'var(--th-text-muted)' }}>No events found</p>
                        </div>
                    )}
                </div>
            </section>

            {selectedEvent && (
                <RegistrationModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onSuccess={refreshEvents}
                />
            )}
        </div>
    );
}
