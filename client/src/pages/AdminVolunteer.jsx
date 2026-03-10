import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, getVolunteerRoles, createVolunteerRole, getAllVolunteerApplications, updateVolunteerApplicationStatus, markVolunteerCompleted, getAllVolunteerPayments, updateVolunteerPaymentStatus } from '../services/api';

export default function AdminVolunteer() {
    const [events, setEvents] = useState([]);
    const [roles, setRoles] = useState([]);
    const [applications, setApplications] = useState([]);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const [activeTab, setActiveTab] = useState('create'); // create, applications, payments

    const [roleForm, setRoleForm] = useState({
        eventId: '', roleTitle: '', description: '', paymentAmount: '', positionsAvailable: ''
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [evRes, rlRes, appRes, payRes] = await Promise.all([
                getEvents(), getVolunteerRoles(), getAllVolunteerApplications(), getAllVolunteerPayments()
            ]);
            setEvents(evRes.data.events || []);
            setRoles(rlRes.data.roles || []);
            setApplications(appRes.data.applications || []);
            setPayments(payRes.data.payments || []);
        } catch (err) {
            console.error('Failed to load volunteer admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const showNotif = (msg, isError = false) => {
        setNotification((isError ? '❌ ' : '✅ ') + msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        try {
            await createVolunteerRole(roleForm);
            showNotif('Volunteer role created successfully!');
            setRoleForm({ eventId: '', roleTitle: '', description: '', paymentAmount: '', positionsAvailable: '' });
            loadData();
        } catch (err) {
            showNotif(err.response?.data?.error || 'Failed to create role', true);
        }
    };

    const handleAppStatus = async (id, status) => {
        try {
            await updateVolunteerApplicationStatus(id, status);
            showNotif(`Application marked as ${status}`);
            loadData();
        } catch (err) {
            showNotif(err.response?.data?.error || 'Failed to update application', true);
        }
    };

    const handleMarkCompleted = async (app) => {
        try {
            await markVolunteerCompleted({
                userId: app.userId,
                eventId: app.eventId,
                roleId: app.roleId,
                amount: app.paymentAmount
            });
            showNotif('Volunteer marked as completed & payment recorded.');
            loadData();
        } catch (err) {
            showNotif(err.response?.data?.error || 'Failed to record completion', true);
        }
    };

    const handlePaymentStatus = async (id, status) => {
        try {
            await updateVolunteerPaymentStatus(id, status);
            showNotif(`Payment marked as ${status}`);
            loadData();
        } catch (err) {
            showNotif(err.response?.data?.error || 'Failed to update payment status', true);
        }
    };

    const pageStyle = { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)', padding: '32px 24px', color: '#e2e8f0' };
    const cardStyle = { background: 'rgba(20, 20, 50, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '24px' };
    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' };
    const btnPrimary = { padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' };

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, padding: '14px 24px', borderRadius: '12px', background: notification.includes('❌') ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <Link to="/admin-dashboard" style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>← Back to Dashboard</Link>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '8px' }}>🤝 Volunteer Management</h1>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {['create', 'applications', 'payments'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', background: activeTab === tab ? '#7c3aed' : 'rgba(139, 92, 246, 0.1)', color: activeTab === tab ? '#fff' : '#a78bfa', transition: 'all 0.2s' }}>
                            {tab === 'create' ? 'Create Roles' : tab === 'applications' ? 'Manage Applications' : 'Payments'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div></div>
                ) : (
                    <>
                        {/* TAB 1: CREATE VOLUNTEER ROLE */}
                        {activeTab === 'create' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', alignItems: 'start' }}>
                                <div style={cardStyle}>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Create New Role</h2>
                                    <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={labelStyle}>Select Event *</label>
                                            <select style={inputStyle} value={roleForm.eventId} onChange={e => setRoleForm({ ...roleForm, eventId: e.target.value })} required>
                                                <option value="">-- Choose Event --</option>
                                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Role Title (e.g. Registration Desk) *</label>
                                            <input style={inputStyle} value={roleForm.roleTitle} onChange={e => setRoleForm({ ...roleForm, roleTitle: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Description *</label>
                                            <textarea style={{ ...inputStyle, minHeight: '80px' }} value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} required />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>Payment (₹) *</label>
                                                <input type="number" step="0.01" style={inputStyle} value={roleForm.paymentAmount} onChange={e => setRoleForm({ ...roleForm, paymentAmount: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Positions *</label>
                                                <input type="number" style={inputStyle} value={roleForm.positionsAvailable} onChange={e => setRoleForm({ ...roleForm, positionsAvailable: e.target.value })} required />
                                            </div>
                                        </div>
                                        <button type="submit" style={{ ...btnPrimary, marginTop: '8px' }}>Create Role</button>
                                    </form>
                                </div>
                                <div style={cardStyle}>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Existing Roles</h2>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                                    {['Event', 'Role', 'Payment', 'Positions'].map(h => <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '0.75rem', color: '#a78bfa' }}>{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {roles.map(r => (
                                                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                                        <td style={{ padding: '10px', fontSize: '0.85rem' }}>{r.eventTitle}</td>
                                                        <td style={{ padding: '10px', fontSize: '0.85rem', fontWeight: 600 }}>{r.roleTitle}</td>
                                                        <td style={{ padding: '10px', fontSize: '0.85rem', color: '#34d399' }}>₹{r.paymentAmount}</td>
                                                        <td style={{ padding: '10px', fontSize: '0.85rem' }}>{r.positionsFilled} / {r.positionsAvailable}</td>
                                                    </tr>
                                                ))}
                                                {roles.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No roles created yet.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: MANAGE APPLICATIONS */}
                        {activeTab === 'applications' && (
                            <div style={cardStyle}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Student Applications ({applications.length})</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                                {['Applicant', 'Event & Role', 'Contact', 'Status', 'Actions', 'Completion'].map(h => <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase' }}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map(app => (
                                                <tr key={app.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{app.fullName}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{app.department} • {app.year}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                        <div style={{ color: '#c4b5fd' }}>{app.eventTitle}</div>
                                                        <div style={{ fontWeight: 600 }}>{app.roleTitle}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                        <div>{app.phone}</div><div>{app.email}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: app.status === 'Approved' ? 'rgba(16,185,129,0.15)' : app.status === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: app.status === 'Approved' ? '#34d399' : app.status === 'Rejected' ? '#f87171' : '#fbbf24' }}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        {app.status === 'Pending' && (
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button onClick={() => handleAppStatus(app.id, 'Approved')} style={{ ...btnPrimary, padding: '4px 10px', fontSize: '0.75rem' }}>Approve</button>
                                                                <button onClick={() => handleAppStatus(app.id, 'Rejected')} style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Reject</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        {app.status === 'Approved' && (
                                                            <button onClick={() => handleMarkCompleted(app)} style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                Mark Completed & Pay 💰
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {applications.length === 0 && <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No applications found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PAYMENTS */}
                        {activeTab === 'payments' && (
                            <div style={cardStyle}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Volunteer Payments ({payments.length})</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                                {['Student', 'Event & Role', 'Amount', 'Status', 'Completed Date', 'Actions'].map(h => <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase' }}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map(pay => (
                                                <tr key={pay.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{pay.userName}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{pay.userEmail}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                        <div style={{ color: '#c4b5fd' }}>{pay.eventTitle}</div>
                                                        <div style={{ fontWeight: 600 }}>{pay.roleTitle}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                                                        ₹{pay.amount}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: pay.status === 'Paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: pay.status === 'Paid' ? '#34d399' : '#fbbf24' }}>
                                                            {pay.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                        {new Date(pay.completedAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        {pay.status === 'Pending' && (
                                                            <button onClick={() => handlePaymentStatus(pay.id, 'Paid')} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '0.75rem' }}>
                                                                Mark as Paid
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {payments.length === 0 && <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No payments recorded.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
