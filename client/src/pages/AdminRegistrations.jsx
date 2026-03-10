import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminRegistrations, toggleAttendance, exportRegistrationsCSV, getEvents, UPLOADS_URL } from '../services/api';

export default function AdminRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ eventId: '', paymentStatus: '', dateFrom: '', dateTo: '' });
    const [notification, setNotification] = useState('');

    useEffect(() => { getEvents().then(r => setEvents(r.data.events || [])).catch(() => { }); }, []);
    useEffect(() => { loadRegistrations(); }, [filters]);

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.eventId) params.eventId = filters.eventId;
            if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
            if (filters.dateFrom) params.dateFrom = filters.dateFrom;
            if (filters.dateTo) params.dateTo = filters.dateTo;
            const res = await getAdminRegistrations(params);
            setRegistrations(res.data.registrations || []);
        } catch (err) {
            console.error('Failed to load registrations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAttendance = async (id) => {
        try {
            const res = await toggleAttendance(id);
            setRegistrations(prev => prev.map(r => r.registrationId === id ? { ...r, attended: res.data.attended } : r));
            setNotification(res.data.attended ? '✅ Marked as attended' : '⬜ Marked as not attended');
            setTimeout(() => setNotification(''), 2000);
        } catch (err) {
            setNotification('❌ Failed to update attendance');
            setTimeout(() => setNotification(''), 2000);
        }
    };

    const handleExportCSV = async () => {
        try {
            const params = {};
            if (filters.eventId) params.eventId = filters.eventId;
            if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
            const res = await exportRegistrationsCSV(params);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'registrations.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setNotification('📥 CSV downloaded!');
            setTimeout(() => setNotification(''), 2000);
        } catch (err) {
            setNotification('❌ No data to export');
            setTimeout(() => setNotification(''), 2000);
        }
    };

    const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

    const pageStyle = { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)', padding: '32px 24px', color: '#e2e8f0' };
    const cardStyle = { background: 'rgba(20, 20, 50, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '24px' };
    const inputStyle = { padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
    const btnPrimary = { padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' };
    const statusBadge = (status) => {
        const colors = { Success: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' }, Pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' }, Failed: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' } };
        const c = colors[status] || colors.Pending;
        return { padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}`, display: 'inline-block' };
    };

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, padding: '14px 24px', borderRadius: '12px', background: notification.includes('❌') ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <Link to="/admin-dashboard" style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>← Back to Dashboard</Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '8px' }}>📋 Manage Registrations</h1>
                    </div>
                    <button onClick={handleExportCSV} style={btnPrimary}>📥 Export CSV</button>
                </div>

                {/* Filters */}
                <div style={{ ...cardStyle, marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Filter by Event</label>
                        <select style={{ ...inputStyle, width: '100%' }} value={filters.eventId} onChange={e => setFilters(f => ({ ...f, eventId: e.target.value }))}>
                            <option value="">All Events</option>
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '0 1 160px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Payment Status</label>
                        <select style={{ ...inputStyle, width: '100%' }} value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}>
                            <option value="">All</option>
                            <option value="Success">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <div style={{ flex: '0 1 160px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>From Date</label>
                        <input type="date" style={{ ...inputStyle, width: '100%' }} value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
                    </div>
                    <div style={{ flex: '0 1 160px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>To Date</label>
                        <input type="date" style={{ ...inputStyle, width: '100%' }} value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
                    </div>
                    <button onClick={() => setFilters({ eventId: '', paymentStatus: '', dateFrom: '', dateTo: '' })} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>🔄 Reset</button>
                </div>

                {/* Table */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Registration Records</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{registrations.length} record(s)</span>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" style={{ margin: '0 auto' }}></div></div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                        {['ID', 'Student', 'Email', 'Event', 'Payment', 'QR', 'Date', 'Attended'].map(h => (
                                            <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map(r => (
                                        <tr key={r.registrationId} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                            <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>#{r.registrationId}</td>
                                            <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{r.studentName}</td>
                                            <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#94a3b8' }}>{r.studentEmail}</td>
                                            <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#c4b5fd', maxWidth: '160px' }}>{r.eventName}</td>
                                            <td style={{ padding: '12px 14px' }}><span style={statusBadge(r.paymentStatus)}>{r.paymentStatus}</span></td>
                                            <td style={{ padding: '12px 14px' }}>
                                                {r.qrCodePath ? <a href={`${UPLOADS_URL}${r.qrCodePath}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.82rem', textDecoration: 'underline' }}>View QR</a> : <span style={{ color: '#64748b', fontSize: '0.82rem' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(r.registrationDate)}</td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <button onClick={() => handleToggleAttendance(r.registrationId)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: r.attended ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)', color: r.attended ? '#34d399' : '#94a3b8', transition: 'all 0.2s' }}>
                                                    {r.attended ? '✅ Yes' : '⬜ No'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {registrations.length === 0 && (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No registrations found with current filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
