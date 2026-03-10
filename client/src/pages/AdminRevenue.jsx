import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminRevenue } from '../services/api';

export default function AdminRevenue() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminRevenue()
            .then(r => setData(r.data.revenue))
            .catch(err => console.error('Revenue error:', err))
            .finally(() => setLoading(false));
    }, []);

    const pageStyle = { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)', padding: '32px 24px', color: '#e2e8f0' };
    const cardStyle = { background: 'rgba(20, 20, 50, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '24px' };

    if (loading) return <div style={pageStyle}><div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div></div></div>;

    const statCards = [
        { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#059669', desc: 'From successful payments' },
        { label: 'Total Registrations', value: data?.totalRegistrations || 0, icon: '📋', color: '#2563eb', desc: 'All time registrations' },
        { label: 'Paid Payments', value: data?.paidCount || 0, icon: '✅', color: '#10b981', desc: 'Successfully completed' },
        { label: 'Pending Payments', value: data?.pendingCount || 0, icon: '⏳', color: '#f59e0b', desc: 'Awaiting confirmation' },
    ];

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <Link to="/admin-dashboard" style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>← Back to Dashboard</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '8px' }}>💰 Revenue Dashboard</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Financial overview and payment analytics</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `${s.color}15` }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>{s.icon}</div>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', marginTop: '2px' }}>{s.value}</p>
                                    <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>{s.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Per-Event Revenue Table */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>📊 Revenue Per Event</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                    {['Event', 'Fee (₹)', 'Registrations', 'Paid', 'Pending', 'Seats Left', 'Revenue (₹)'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.perEvent || []).map(ev => (
                                    <tr key={ev.eventId} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0', maxWidth: '200px' }}>{ev.eventName}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>₹{ev.fee}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                            <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>{ev.registrationCount}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#34d399', fontWeight: 600 }}>{ev.paidCount}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                                            <span style={{ color: ev.pendingCount > 0 ? '#fbbf24' : '#64748b', fontWeight: 600 }}>{ev.pendingCount}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                                            <span style={{ color: ev.availableSeats > 0 ? '#34d399' : '#f87171' }}>{ev.availableSeats}</span>
                                            <span style={{ color: '#64748b' }}>/{ev.totalSeats}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: 700, color: ev.revenue > 0 ? '#34d399' : '#64748b' }}>₹{(ev.revenue || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.perEvent || data.perEvent.length === 0) && (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No revenue data available yet.</td></tr>
                                )}
                            </tbody>
                            {data?.perEvent?.length > 0 && (
                                <tfoot>
                                    <tr style={{ borderTop: '2px solid rgba(139, 92, 246, 0.3)' }}>
                                        <td style={{ padding: '16px', fontWeight: 800, fontSize: '0.95rem', color: '#e2e8f0' }}>TOTAL</td>
                                        <td></td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: '#818cf8' }}>{data.totalRegistrations}</td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: '#34d399' }}>{data.paidCount}</td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: '#fbbf24' }}>{data.pendingCount}</td>
                                        <td></td>
                                        <td style={{ padding: '16px', fontWeight: 800, fontSize: '1.1rem', color: '#34d399' }}>₹{(data.totalRevenue || 0).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
