import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClubs, createClub, deleteClub } from '../services/api';

const CLUB_TYPES = ['Technical', 'Cultural', 'Entrepreneurship', 'Sports', 'Social', 'Academic', 'Other'];

export default function AdminCreateClub() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({ name: '', type: '', description: '' });
    const [error, setError] = useState('');

    useEffect(() => { loadClubs(); }, []);

    const loadClubs = async () => {
        setLoading(true);
        try {
            const res = await getClubs();
            setClubs(res.data.clubs || []);
        } catch { }
        finally { setLoading(false); }
    };

    const showNotif = (msg, isError = false) => {
        setNotification((isError ? '❌ ' : '✅ ') + msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.type) { setError('Name and type are required.'); return; }
        setSubmitting(true);
        try {
            await createClub(form);
            showNotif(`Club "${form.name}" created successfully!`);
            setForm({ name: '', type: '', description: '' });
            loadClubs();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create club.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteClub(id);
            showNotif('Club deleted successfully.');
            setDeleteConfirm(null);
            loadClubs();
        } catch (err) {
            showNotif(err.response?.data?.error || 'Failed to delete club.', true);
        }
    };

    const pageStyle = { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)', padding: '32px 24px', color: '#e2e8f0' };
    const cardStyle = { background: 'rgba(20, 20, 50, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '24px' };
    const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '5px' };
    const btnPrimary = { padding: '11px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' };
    const btnDanger = { padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' };
    const modalOverlay = { position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
    const modalBox = { ...cardStyle, maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' };

    const typeColors = { Technical: '#818cf8', Cultural: '#f472b6', Entrepreneurship: '#34d399', Sports: '#fbbf24', Social: '#60a5fa', Academic: '#a78bfa', Other: '#94a3b8' };

    return (
        <div style={pageStyle}>
            {notification && (
                <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, padding: '14px 24px', borderRadius: '12px', background: notification.includes('❌') ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
                    {notification}
                </div>
            )}

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ marginBottom: '28px' }}>
                    <Link to="/admin-dashboard" style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>← Back to Dashboard</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '8px' }}>🏛️ Club Management</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>Create and manage clubs for EventBuzz</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
                    {/* ── Create Club Form ── */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '18px' }}>➕ Create New Club</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Club Name *</label>
                                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Photography Club" required />
                            </div>
                            <div>
                                <label style={labelStyle}>Club Type *</label>
                                <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
                                    <option value="">-- Select Type --</option>
                                    {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this club do?" />
                            </div>
                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '0.82rem', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, marginTop: '4px' }}>
                                {submitting ? '⏳ Creating...' : '🏛️ Create Club'}
                            </button>
                        </form>
                    </div>

                    {/* ── Existing Clubs Table ── */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Existing Clubs</h2>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{clubs.length} club(s)</span>
                        </div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '30px' }}><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div></div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                            {['Name', 'Type', 'Description', 'Action'].map(h => (
                                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clubs.map(club => (
                                            <tr key={club.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.08)' }}>
                                                <td style={{ padding: '12px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{club.name}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${typeColors[club.type] || '#94a3b8'}22`, color: typeColors[club.type] || '#94a3b8', border: `1px solid ${typeColors[club.type] || '#94a3b8'}44` }}>
                                                        {club.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '0.82rem', color: '#64748b', maxWidth: '300px' }}>{club.description || '—'}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <button onClick={() => setDeleteConfirm(club)} style={btnDanger}>🗑️ Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {clubs.length === 0 && (
                                            <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No clubs found. Create your first club! 🏛️</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={modalOverlay} onClick={() => setDeleteConfirm(null)}>
                    <div style={modalBox} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '14px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Delete Club?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '20px' }}>
                            Are you sure you want to delete <strong style={{ color: '#e2e8f0' }}>"{deleteConfirm.name}"</strong>? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'transparent', color: '#a78bfa', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} style={{ ...btnDanger, background: 'rgba(239, 68, 68, 0.8)', color: '#fff', padding: '10px 20px' }}>🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
