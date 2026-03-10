import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRegistrations, getMyApplications, getMyVolunteerApplications, getMyVolunteerPayments } from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [applications, setApplications] = useState([]);
    const [volunteerApps, setVolunteerApps] = useState([]);
    const [volunteerPayments, setVolunteerPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getMyRegistrations().catch(() => ({ data: { registrations: [] } })),
            getMyApplications().catch(() => ({ data: { applications: [] } })),
            getMyVolunteerApplications().catch(() => ({ data: { applications: [] } })),
            getMyVolunteerPayments().catch(() => ({ data: { payments: [] } }))
        ]).then(([r, a, vApp, vPay]) => {
            setRegistrations(r.data.registrations || []);
            setApplications(a.data.applications || []);
            setVolunteerApps(vApp.data.applications || []);
            setVolunteerPayments(vPay.data.payments || []);
            setLoading(false);
        });
    }, []);

    const formatDate = (d) => d ? new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div></div>;

    return (
        <div className="page-container">
            <div className="glass-card p-7 mb-8 hover:!transform-none reveal">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="w-[72px] h-[72px] bg-gradient-to-br from-ember to-ember-dark rounded-2xl flex items-center justify-center shadow-lg shadow-ember/20">
                        <span className="text-3xl font-extrabold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-charcoal">{user?.name}</h1>
                        <p className="text-text-secondary text-sm mt-0.5">{user?.email}</p>
                        <span className="badge badge-info mt-2">{user?.role}</span>
                    </div>
                    <Link to="/dashboard/my-tickets" className="btn-primary text-sm">🎫 My Tickets</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                    { val: registrations.length, label: 'Events Registered', icon: '🎪', bg: 'bg-gradient-to-br from-ember-50 to-sand' },
                    { val: registrations.filter(r => r.paymentStatus === 'Success').length, label: 'Confirmed Tickets', icon: '✅', bg: 'bg-gradient-to-br from-frost-50 to-sand' },
                    { val: applications.length, label: 'Club Applications', icon: '📋', bg: 'bg-gradient-to-br from-amber-50 to-sand' },
                ].map((s, i) => (
                    <div key={i} className={`glass-card p-6 text-center hover:!transform-none reveal ${s.bg}`} style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                        <span className="text-3xl mb-2 block">{s.icon}</span>
                        <p className="text-3xl font-extrabold text-charcoal">{s.val}</p>
                        <p className="text-sm text-text-secondary mt-1 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="glass-card p-7 mb-8 hover:!transform-none reveal" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                <h2 className="text-lg font-bold text-charcoal mb-5 flex items-center gap-2">🎪 Recent Registrations</h2>
                {registrations.length === 0 ? (
                    <div className="text-center py-10"><span className="text-5xl block mb-3">🎯</span><p className="text-lg text-text-muted font-medium mb-2">No registrations yet</p><Link to="/events" className="text-ember font-semibold hover:underline text-sm">Browse Events →</Link></div>
                ) : (
                    <div className="space-y-3">{registrations.slice(0, 5).map((r, i) => (
                        <div key={r.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-sand to-surface rounded-xl border border-border-light reveal" style={{ animationDelay: `${0.2 + i * 0.05}s`, animationFillMode: 'both' }}>
                            <div className="flex-1"><p className="font-bold text-charcoal">{r.eventTitle}</p><p className="text-sm text-text-muted">{formatDate(r.eventDate)} • {r.startTime} – {r.endTime}</p></div>
                            <span className="badge badge-success">✓ {r.paymentStatus}</span>
                        </div>
                    ))}</div>
                )}
            </div>

            <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <h2 className="text-lg font-bold text-charcoal mb-5 flex items-center gap-2">🏛️ Club Applications</h2>
                {applications.length === 0 ? (
                    <div className="text-center py-10"><span className="text-5xl block mb-3">🤝</span><p className="text-lg text-text-muted font-medium mb-2">No applications yet</p><Link to="/clubs" className="text-ember font-semibold hover:underline text-sm">Explore Clubs →</Link></div>
                ) : (
                    <div className="space-y-3">{applications.map((a, i) => (
                        <div key={a.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-sand to-surface rounded-xl border border-border-light reveal" style={{ animationDelay: `${0.25 + i * 0.05}s`, animationFillMode: 'both' }}>
                            <div className="flex-1"><p className="font-bold text-charcoal">{a.clubName}</p><p className="text-sm text-text-muted">Applied as {a.department}, {a.year}</p></div>
                            <span className={`badge ${a.status === 'Selected' ? 'badge-success' : a.status === 'Rejected' ? 'badge-danger' : a.status === 'Interview' ? 'badge-warning' : 'badge-info'}`}>{a.status}</span>
                        </div>
                    ))}</div>
                )}
            </div>

            <div className="glass-card p-7 hover:!transform-none reveal" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
                <h2 className="text-lg font-bold text-charcoal mb-5 flex items-center gap-2">🤝 My Volunteer Work</h2>
                {volunteerApps.length === 0 ? (
                    <div className="text-center py-10"><span className="text-5xl block mb-3">🛠️</span><p className="text-lg text-text-muted font-medium mb-2">No volunteer work yet</p><Link to="/volunteer" className="text-ember font-semibold hover:underline text-sm">Find Opportunities →</Link></div>
                ) : (
                    <div className="space-y-4">
                        {volunteerApps.map((app, i) => {
                            const payment = volunteerPayments.find(p => p.roleId === app.roleId && p.eventId === app.eventId);
                            return (
                                <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-sand to-surface rounded-xl border border-border-light reveal" style={{ animationDelay: `${0.3 + i * 0.05}s`, animationFillMode: 'both' }}>
                                    <div className="flex-1">
                                        <p className="font-bold text-charcoal">{app.eventTitle}</p>
                                        <p className="text-sm font-medium text-ember">{app.roleTitle}</p>
                                        <p className="text-xs text-text-muted mt-1">Applied: {formatDate(app.appliedAt)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`badge ${app.status === 'Approved' ? 'badge-success' : app.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>App: {app.status}</span>
                                        {app.status === 'Approved' && payment && (
                                            <span className={`badge ${payment.status === 'Paid' ? 'badge-success' : 'badge-info'}`}>
                                                Payment: {payment.status} (₹{payment.amount})
                                            </span>
                                        )}
                                        {app.status === 'Approved' && !payment && (
                                            <span className="badge badge-warning">Task Pending</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}
