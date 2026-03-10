import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClubs } from '../services/api';
import InfiniteMenu from '../components/InfiniteMenu';

/* Unique visual identity per club — with real Unsplash images */
const clubVisuals = {
    'E-Cell': { gradient: 'from-amber via-amber-dark to-ember', gradientStart: '#F0A043', gradientEnd: '#E8725C', icon: '🚀', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=512&h=512&fit=crop' },
    'Coding Club': { gradient: 'from-frost via-frost-dark to-teal-700', gradientStart: '#2EC4B6', gradientEnd: '#0d9488', icon: '💻', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=512&h=512&fit=crop' },
    'Robotics Club': { gradient: 'from-teal-400 via-frost to-frost-dark', gradientStart: '#2dd4bf', gradientEnd: '#25A99D', icon: '🤖', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=512&h=512&fit=crop' },
    'AI Club': { gradient: 'from-ember-light via-ember to-ember-dark', gradientStart: '#F19B8E', gradientEnd: '#D4604F', icon: '🧠', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=512&h=512&fit=crop' },
    'Dance Club': { gradient: 'from-rose-400 via-pink-500 to-ember', gradientStart: '#fb7185', gradientEnd: '#E8725C', icon: '💃', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=512&h=512&fit=crop' },
    'Music Club': { gradient: 'from-amber-light via-amber to-amber-dark', gradientStart: '#F5C27E', gradientEnd: '#D88C32', icon: '🎵', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=512&h=512&fit=crop' },
    'Drama Club': { gradient: 'from-ember via-ember-dark to-rose-700', gradientStart: '#E8725C', gradientEnd: '#be123c', icon: '🎭', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=512&h=512&fit=crop' },
};
const getVisuals = (name) => clubVisuals[name] || { gradient: 'from-text-muted to-text-secondary', gradientStart: '#B8A494', gradientEnd: '#8B7262', icon: '🏛️', image: '' };

const typeConfig = {
    Entrepreneurship: { label: '🚀 Entrepreneurship' },
    Technical: { label: '💻 Technical' },
    Cultural: { label: '🎭 Cultural' },
};

export default function Clubs() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { getClubs().then(r => setClubs(r.data.clubs)).catch(console.error).finally(() => setLoading(false)); }, []);
    const grouped = clubs.reduce((a, c) => { if (!a[c.type]) a[c.type] = []; a[c.type].push(c); return a; }, {});

    const menuItems = clubs.map(club => {
        const v = getVisuals(club.name);
        return { image: v.image, link: `/club/${club.id}`, title: club.name, description: club.type, icon: v.icon, gradientStart: v.gradientStart, gradientEnd: v.gradientEnd, clubId: club.id };
    });

    const handleMenuSelect = (item) => { if (item?.clubId) navigate(`/club/${item.clubId}`); };

    if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div></div>;

    return (
        <div>
            {/* Full-Size 3D Globe */}
            <section className="relative" style={{ height: '85vh', minHeight: '550px', background: 'var(--th-hero-grad)' }}>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
                    <h1 className="section-title text-4xl lg:text-5xl !mb-2">Campus Clubs</h1>
                    <p className="text-text-secondary text-sm sm:text-base">Drag the globe to explore • Click "View Club" to visit</p>
                </div>
                <div className="absolute inset-0">
                    {menuItems.length > 0 && (
                        <InfiniteMenu items={menuItems} scale={1} onSelect={handleMenuSelect} />
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: `linear-gradient(to top, var(--th-bg), transparent)` }}></div>
            </section>

            {/* Club Cards Grid */}
            <section className="page-container">
                <div className="text-center mb-10 reveal">
                    <h2 className="text-2xl font-extrabold text-charcoal">Browse All Clubs</h2>
                    <p className="text-text-secondary text-sm mt-1">Find your community and apply to join</p>
                </div>

                {Object.entries(grouped).map(([type, typeClubs]) => {
                    const tc = typeConfig[type] || { label: type };
                    return (
                        <div key={type} className="mb-14">
                            <div className="flex items-center gap-4 mb-7">
                                <h2 className="text-xl font-extrabold text-charcoal">{tc.label} Clubs</h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                                {typeClubs.map((club, i) => {
                                    const v = getVisuals(club.name);
                                    return (
                                        <Link key={club.id} to={`/club/${club.id}`} className={`glass-card overflow-hidden group reveal stagger-${i + 1}`} style={{ animationFillMode: 'both' }}>
                                            {/* Real image banner */}
                                            <div className={`relative h-48 bg-gradient-to-br ${v.gradient} overflow-hidden`}>
                                                {v.image && <img src={v.image} alt={club.name} className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-700" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                                                <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl">{v.icon}</div>
                                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                                    <h3 className="text-xl font-extrabold text-white drop-shadow-lg">{club.name}</h3>
                                                    <span className="text-xs text-white/70 font-medium uppercase tracking-wider">{club.type}</span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">{club.description}</p>
                                                <div className="mt-4 flex items-center gap-2 text-ember text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                                                    View Club <span className="transition-transform group-hover:translate-x-1">→</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
