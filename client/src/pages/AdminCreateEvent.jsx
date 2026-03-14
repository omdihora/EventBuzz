import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, getClubs } from '../services/api';

export default function AdminCreateEvent() {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '', description: '', organizerClubId: '', date: '',
        startTime: '', endTime: '', venue: '', totalSeats: '', fee: ''
    });
    const [banner, setBanner] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => { getClubs().then(r => setClubs(r.data.clubs || [])).catch(() => { }); }, []);

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleBanner = (e) => {
        const file = e.target.files[0];
        if (file) { setBanner(file); setPreview(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.title || !form.date || !form.startTime || !form.endTime || !form.venue || !form.totalSeats) {
            setError('Please fill all required fields.');
            return;
        }

        setLoading(true);
        try {
            // Send as JSON — backend reads req.body via express.json()
            await createEvent({
                ...form,
                fee: form.fee || 0,
                bannerUrl: null,
            });
            navigate('/admin-dashboard', { state: { notification: '🎉 Event published successfully!' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    const pageStyle = { minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)', padding: '32px 24px', color: '#e2e8f0' };
    const cardStyle = { background: 'rgba(20, 20, 50, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '20px', padding: '32px', maxWidth: '720px', margin: '0 auto' };
    const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };
    const labelStyle = { display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' };
    const btnPrimary = { padding: '14px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)', transition: 'all 0.2s' };

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <button onClick={() => navigate('/admin-dashboard')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ← Back to Dashboard
                </button>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)' }}>✨</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create New Event</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Fill in the details to publish a new event</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <label style={labelStyle}>Event Title *</label>
                        <input style={inputStyle} value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Tech Hackathon 2026" required />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Write a compelling description..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={labelStyle}>Organizer Club</label>
                            <select style={inputStyle} value={form.organizerClubId} onChange={e => handleChange('organizerClubId', e.target.value)}>
                                <option value="">Select Club</option>
                                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Event Date *</label>
                            <input type="date" style={inputStyle} value={form.date} onChange={e => handleChange('date', e.target.value)} required />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={labelStyle}>Start Time *</label>
                            <input style={inputStyle} value={form.startTime} onChange={e => handleChange('startTime', e.target.value)} placeholder="e.g. 09:00 AM" required />
                        </div>
                        <div>
                            <label style={labelStyle}>End Time *</label>
                            <input style={inputStyle} value={form.endTime} onChange={e => handleChange('endTime', e.target.value)} placeholder="e.g. 05:00 PM" required />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Venue *</label>
                        <input style={inputStyle} value={form.venue} onChange={e => handleChange('venue', e.target.value)} placeholder="e.g. Main Auditorium" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={labelStyle}>Total Seats *</label>
                            <input type="number" min="1" style={inputStyle} value={form.totalSeats} onChange={e => handleChange('totalSeats', e.target.value)} placeholder="200" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Registration Fee (₹)</label>
                            <input type="number" min="0" step="0.01" style={inputStyle} value={form.fee} onChange={e => handleChange('fee', e.target.value)} placeholder="0" />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Banner Image</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <label style={{ padding: '10px 20px', borderRadius: '10px', border: '1px dashed rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.05)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                📁 Choose File
                                <input type="file" accept="image/*" onChange={handleBanner} style={{ display: 'none' }} />
                            </label>
                            {preview && <img src={preview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(139, 92, 246, 0.2)' }} />}
                            {banner && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{banner.name}</span>}
                        </div>
                    </div>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.85rem', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1, marginTop: '8px' }}>
                        {loading ? '⏳ Publishing...' : '🚀 Publish Event'}
                    </button>
                </form>
            </div>
        </div>
    );
}
