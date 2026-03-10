import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClub, submitClubApplication, getClubApplications, updateApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';

const clubImages = {
    'E-Cell': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=400&fit=crop',
    'Coding Club': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop',
    'Robotics Club': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=400&fit=crop',
    'AI Club': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
    'Dance Club': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200&h=400&fit=crop',
    'Music Club': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop',
    'Drama Club': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&h=400&fit=crop',
};
const clubGradients = {
    'E-Cell': 'from-amber via-amber-dark to-ember',
    'Coding Club': 'from-frost via-frost-dark to-teal-700',
    'Robotics Club': 'from-teal-400 via-frost to-frost-dark',
    'AI Club': 'from-ember-light via-ember to-ember-dark',
    'Dance Club': 'from-rose-400 via-pink-500 to-ember',
    'Music Club': 'from-amber-light via-amber to-amber-dark',
    'Drama Club': 'from-ember via-ember-dark to-rose-700',
};
const clubIcons = { 'E-Cell': '🚀', 'Coding Club': '💻', 'Robotics Club': '🤖', 'AI Club': '🧠', 'Dance Club': '💃', 'Music Club': '🎵', 'Drama Club': '🎭' };

export default function ClubDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ fullName: user?.name || '', enrollmentNumber: '', department: '', year: '', skills: '', reason: '', resume: null });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { loadClub(); }, [id]);
    const loadClub = async () => { try { const r = await getClub(id); setClub(r.data.club); if (user?.role === 'ClubAdmin' || user?.role === 'SuperAdmin') { const a = await getClubApplications(id); setApplications(a.data.applications); } } catch (e) { console.error(e); } finally { setLoading(false); } };

    const handleApply = async (e) => {
        e.preventDefault(); setSubmitting(true); setMsg('');
        const fd = new FormData();
        fd.append('clubId', id);
        fd.append('fullName', form.fullName);
        fd.append('enrollmentNumber', form.enrollmentNumber);
        fd.append('department', form.department);
        fd.append('year', form.year);
        fd.append('skills', form.skills);
        fd.append('reason', form.reason);
        if (form.resume) fd.append('resume', form.resume);
        try { await submitClubApplication(fd); setMsg('✅ Application submitted!'); setShowForm(false); setForm({ fullName: user?.name || '', enrollmentNumber: '', department: '', year: '', skills: '', reason: '', resume: null }); }
        catch (e) { setMsg(`❌ ${e.response?.data?.error || 'Submission failed.'}`); }
        finally { setSubmitting(false); }
    };

    const handleStatusChange = async (appId, status) => { try { await updateApplication(appId, { status }); const a = await getClubApplications(id); setApplications(a.data.applications); } catch (e) { console.error(e); } };

    if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div></div>;
    if (!club) return <div className="page-container text-center py-20 reveal"><h2 className="text-2xl font-bold text-charcoal">Club not found</h2></div>;

    const gradient = clubGradients[club.name] || 'from-text-muted to-text-secondary';
    const image = clubImages[club.name];
    const icon = clubIcons[club.name] || '🏛️';

    return (
        <div className="page-container max-w-4xl">
            {/* Hero with real image */}
            <div className={`relative h-56 sm:h-72 bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden mb-8 reveal`}>
                {image && <img src={image} alt={club.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">{icon}</div>
                <div className="absolute bottom-7 left-7 right-7">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-semibold uppercase tracking-wider mb-3">{club.type}</span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">{club.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
                        <h2 className="text-lg font-bold text-charcoal mb-3">About {club.name}</h2>
                        <p className="text-text-secondary leading-relaxed">{club.description}</p>
                    </div>
                    {club.events?.length > 0 && (
                        <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                            <h2 className="text-lg font-bold text-charcoal mb-5">🎪 Upcoming Events</h2>
                            <div className="space-y-3">{club.events.map(ev => (
                                <Link key={ev.id} to={`/event/${ev.id}`} className="flex items-center gap-4 p-4 bg-gradient-to-r from-sand to-surface rounded-xl border border-border-light hover:border-ember/20 transition-all group">
                                    <div className="flex-1"><p className="font-bold text-charcoal group-hover:text-ember transition-colors">{ev.title}</p><p className="text-sm text-text-muted">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {ev.venue}</p></div>
                                    <span className="text-ember text-sm font-bold">₹{ev.fee}</span>
                                </Link>
                            ))}</div>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    <div className="glass-card p-6 hover:!transform-none reveal" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                        <h3 className="font-bold text-charcoal mb-4">📋 Apply to Join</h3>
                        <p className="text-sm text-text-secondary mb-4">Interested in {club.name}? Fill out the application form below and we'll get back to you!</p>
                        {msg && <div className="text-sm mb-3 p-3 rounded-xl bg-sand border border-border-light">{msg}</div>}
                        {!user ? (
                            <div className="text-center py-4">
                                <span className="text-4xl block mb-3">🔐</span>
                                <p className="text-sm text-text-secondary mb-4">Login to submit your application</p>
                                <button onClick={() => navigate('/login')} className="btn-primary w-full">Login to Apply →</button>
                            </div>
                        ) : !showForm ? (
                            <button onClick={() => setShowForm(true)} className="btn-primary w-full">Apply Now →</button>
                        ) : (
                            <form onSubmit={handleApply} className="space-y-3.5">
                                <div><input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input-field text-sm" placeholder="Full Name" required /></div>
                                <div><input type="text" value={form.enrollmentNumber} onChange={e => setForm({ ...form, enrollmentNumber: e.target.value })} className="input-field text-sm" placeholder="Enrollment / Roll Number" required /></div>
                                <div><input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field text-sm" placeholder="Department (e.g. CSE)" required /></div>
                                <div><select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="input-field text-sm" required><option value="">Select Year</option>{['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                                <div><input type="text" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="input-field text-sm" placeholder="Primary Skills (e.g. React, Event Management)" /></div>
                                <div><textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input-field text-sm" rows={3} placeholder="Why do you want to join?" required /></div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Resume (optional)</label>
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => setForm({ ...form, resume: e.target.files[0] })} className="input-field text-sm" />
                                </div>
                                <div className="flex gap-2"><button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm">{submitting ? '⏳...' : '📤 Submit'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm">Cancel</button></div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {(user?.role === 'ClubAdmin' || user?.role === 'SuperAdmin') && applications.length > 0 && (
                <div className="glass-card p-7 mt-8 hover:!transform-none reveal" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <h2 className="text-lg font-bold text-charcoal mb-5">👥 Applications ({applications.length})</h2>
                    <div className="space-y-3">{applications.map(a => (
                        <div key={a.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-sand to-surface rounded-xl border border-border-light">
                            <div className="flex-1">
                                <p className="font-bold text-charcoal">{a.fullName}</p>
                                <p className="text-sm text-text-muted">{a.department} • {a.year} • Enr: {a.enrollmentNumber}</p>
                                {a.skills && <p className="text-sm font-semibold text-text-secondary mt-1">Skills: {a.skills}</p>}
                                {a.reason && <p className="text-sm text-text-secondary mt-1">"{a.reason}"</p>}
                                {a.resumePath && <a href={`http://localhost:5000/uploads${a.resumePath}`} target="_blank" className="text-frost-dark text-xs font-semibold mt-1 inline-block hover:underline">📄 View Resume</a>}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${a.status === 'Selected' ? 'badge-success' : a.status === 'Rejected' ? 'badge-danger' : a.status === 'Interview' ? 'badge-warning' : 'badge-info'}`}>{a.status}</span>
                                <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)} className="input-field !w-auto text-xs !py-1.5 !px-2.5"><option>Pending</option><option>Interview</option><option>Selected</option><option>Rejected</option></select>
                            </div>
                        </div>
                    ))}</div>
                </div>
            )}
        </div>
    );
}
