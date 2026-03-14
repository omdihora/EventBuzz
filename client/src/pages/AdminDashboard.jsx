import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, deleteEvent, getAdminStats, getClubs } from '../services/api';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, totalRevenue: 0, availableSeats: 0 });
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [notification, setNotification] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [evRes, stRes, clRes] = await Promise.all([getEvents(), getAdminStats(), getClubs()]);
            setEvents(evRes.data.events || []);
            setStats(stRes.data.stats || {});
            setClubs(clRes.data.clubs || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await deleteEvent(deleteModal);
            setDeleteModal(null);
            setNotification('🗑️ Event deleted successfully!');
            setTimeout(() => setNotification(''), 3000);
            loadData();
        } catch (err) {
            setNotification('❌ Failed to delete event.');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send as JSON (not FormData) so Express req.body is populated correctly
            const { default: api } = await import('../services/api');
            await api.put(`/events/${editModal}`, editForm);
            setEditModal(null);
            setNotification('✅ Event updated successfully!');
            setTimeout(() => setNotification(''), 3000);
            loadData();
        } catch (err) {
            setNotification('❌ Failed to update event.');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    const openEdit = (ev) => {
        setEditForm({
            title: ev.title, description: ev.description || '', organizerClubId: ev.organizerClubId || '',
            date: ev.date, startTime: ev.startTime, endTime: ev.endTime,
            venue: ev.venue, totalSeats: ev.totalSeats, fee: ev.fee
        });
        setEditModal(ev.id);
    };

    const handleLogout = () => { logout(); navigate('/admin-login'); };

    const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

    const statCards = [
        { label: 'Total Events', value: stats.totalEvents, icon: '📅', color: '#7c3aed' },
        { label: 'Registrations', value: stats.totalRegistrations, icon: '📋', color: '#2563eb' },
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#059669' },
        { label: 'Available Seats', value: stats.availableSeats, icon: '💺', color: '#d97706' },
    ];

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div></div>;

    const pageStyle = { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)', padding: '32px 24px', color: '#e2e8f0' };
    const cardStyle = { background: 'rgba(20, 20, 50, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '24px' };
    const btnPrimary = { padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' };
    const btnDanger = { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' };
    const btnOutline = { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'transparent', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' };
    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
    const modalOverlay = { position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
    const modalBox = { ...cardStyle, maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' };

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Notification */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, padding: '14px 24px', borderRadius: '12px', background: notification.includes('❌') ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease' }}>
                        {notification}
                    </div>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Welcome back, {user?.name || 'Admin'} 👋</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Link to="/admin/create-event" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>✨ Create Event</Link>
                        <Link to="/admin/clubs" style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>🏛️ Clubs</Link>
                        <Link to="/admin/manage-registrations" style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>📋 Registrations</Link>
                        <Link to="/admin/revenue" style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>💰 Revenue</Link>
                        <Link to="/admin/volunteer" style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>🤝 Volunteers</Link>
                        <button onClick={handleLogout} style={{ ...btnDanger }}>🚪 Logout</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{s.icon}</div>
                            <div>
                                <p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginTop: '2px' }}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Events Table */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>📅 All Events</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{events.length} event(s)</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                    {['Event', 'Club', 'Date', 'Venue', 'Seats', 'Fee', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0', maxWidth: '200px' }}>{ev.title}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94a3b8' }}>{ev.clubName || '—'}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94a3b8' }}>{formatDate(ev.date)}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '150px' }}>{ev.venue}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                                            <span style={{ color: ev.availableSeats > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>{ev.availableSeats}</span>
                                            <span style={{ color: '#64748b' }}>/{ev.totalSeats}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>₹{ev.fee}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => openEdit(ev)} style={{ ...btnOutline, fontSize: '0.75rem', padding: '6px 12px' }}>✏️ Edit</button>
                                                <button onClick={() => setDeleteModal(ev.id)} style={{ ...btnDanger, fontSize: '0.75rem', padding: '6px 12px' }}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No events yet. Create your first event! 🎉</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div style={modalOverlay} onClick={() => setDeleteModal(null)}>
                    <div style={{ ...modalBox, maxWidth: '420px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Delete Event?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>This will permanently remove the event and all related registrations & payments. This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteModal(null)} style={btnOutline}>Cancel</button>
                            <button onClick={handleDelete} style={{ ...btnDanger, background: 'rgba(239, 68, 68, 0.8)', color: '#fff', padding: '10px 24px' }}>🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div style={modalOverlay} onClick={() => setEditModal(null)}>
                    <div style={modalBox} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>✏️ Edit Event</h3>
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Title</label>
                                <input style={inputStyle} value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Description</label>
                                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Club</label>
                                    <select style={inputStyle} value={editForm.organizerClubId || ''} onChange={e => setEditForm(f => ({ ...f, organizerClubId: e.target.value }))}>
                                        <option value="">None</option>
                                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Date</label>
                                    <input type="date" style={inputStyle} value={editForm.date || ''} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Start Time</label>
                                    <input style={inputStyle} value={editForm.startTime || ''} onChange={e => setEditForm(f => ({ ...f, startTime: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>End Time</label>
                                    <input style={inputStyle} value={editForm.endTime || ''} onChange={e => setEditForm(f => ({ ...f, endTime: e.target.value }))} required />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Venue</label>
                                <input style={inputStyle} value={editForm.venue || ''} onChange={e => setEditForm(f => ({ ...f, venue: e.target.value }))} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Total Seats</label>
                                    <input type="number" style={inputStyle} value={editForm.totalSeats || ''} onChange={e => setEditForm(f => ({ ...f, totalSeats: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Fee (₹)</label>
                                    <input type="number" step="0.01" style={inputStyle} value={editForm.fee || ''} onChange={e => setEditForm(f => ({ ...f, fee: e.target.value }))} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button type="button" onClick={() => setEditModal(null)} style={btnOutline}>Cancel</button>
                                <button type="submit" style={btnPrimary}>💾 Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
