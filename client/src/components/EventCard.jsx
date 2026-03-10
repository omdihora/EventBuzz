import { Link } from 'react-router-dom';

const eventGradients = {
    1: 'from-ember via-ember-dark to-amber-dark',
    2: 'from-amber via-amber-dark to-ember',
    3: 'from-frost via-frost-dark to-teal-700',
    4: 'from-ember-light via-ember to-ember-dark',
    5: 'from-rose-400 via-pink-500 to-ember',
    6: 'from-frost-light via-frost to-frost-dark',
    7: 'from-amber-light via-amber to-ember',
    8: 'from-teal-400 via-frost to-frost-dark',
};
const eventIcons = { 1: '💻', 2: '🚀', 3: '🤖', 4: '🎭', 5: '🪩', 6: '⌨️', 7: '📸', 8: '🧠' };

export default function EventCard({ event, onRegister, index = 0 }) {
    const g = eventGradients[event.id] || eventGradients[((event.id - 1) % 8) + 1];
    const icon = eventIcons[event.id] || '🎪';
    const seatPct = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className={`glass-card overflow-hidden group reveal stagger-${(index % 8) + 1}`} style={{ animationFillMode: 'both' }}>
            <Link to={`/event/${event.id}`} className={`block h-44 bg-gradient-to-br ${g} relative flex items-center justify-center overflow-hidden`}>
                <span className="text-7xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 select-none">{icon}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10"></div>
                {event.fee === 0 && <span className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-frost text-white text-[0.65rem] font-bold rounded-full shadow-lg shadow-frost/30 uppercase tracking-wider">Free</span>}
            </Link>
            <div className="p-5">
                <Link to={`/event/${event.id}`}><h3 className="text-lg font-bold mb-1.5 group-hover:text-ember transition-colors duration-300 line-clamp-1" style={{ color: 'var(--th-charcoal)' }}>{event.title}</h3></Link>
                {event.clubName && <Link to={`/club/${event.organizerClubId}`} className="inline-flex items-center gap-1 text-xs text-frost-dark font-semibold hover:text-frost transition-colors">🏛️ {event.clubName}</Link>}
                <div className="mt-3.5 space-y-2 text-[0.82rem]" style={{ color: 'var(--th-text-secondary)' }}>
                    <div className="flex items-center gap-2"><span className="text-base">📅</span><span>{formatDate(event.date)}</span></div>
                    <div className="flex items-center gap-2"><span className="text-base">🕐</span><span>{event.startTime} – {event.endTime}</span></div>
                    <div className="flex items-center gap-2"><span className="text-base">📍</span><span className="truncate">{event.venue}</span></div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-ember">{event.fee === 0 ? 'Free' : `₹${event.fee}`}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--th-text-muted)' }}>{event.availableSeats}/{event.totalSeats} seats</span>
                </div>
                <div className="w-full h-1.5 bg-sand rounded-full mt-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ease-out ${seatPct > 80 ? 'bg-gradient-to-r from-ember to-ember-dark' : seatPct > 50 ? 'bg-gradient-to-r from-amber to-amber-dark' : 'bg-gradient-to-r from-frost to-frost-dark'}`} style={{ width: `${seatPct}%` }}></div>
                </div>
                <button onClick={() => onRegister && onRegister(event)} disabled={event.availableSeats === 0} className="btn-primary w-full mt-4 text-sm !py-2.5">
                    {event.availableSeats === 0 ? '🚫 Sold Out' : '🎫 Register Now'}
                </button>
            </div>
        </div>
    );
}
