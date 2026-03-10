import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applyForVolunteerRole } from '../services/api';

export default function VolunteerApplyModal({ role, event, onClose }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        department: '',
        year: '',
        skills: '',
        reason: '',
        availability: 'Yes'
    });
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('processing');
        setErrorMsg('');

        try {
            await applyForVolunteerRole({
                eventId: event.id,
                roleId: role.id,
                ...form
            });
            setStatus('success');
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
            setStatus('error');
        }
    };

    if (status === 'processing') {
        return (
            <div className="modal-overlay">
                <div className="modal-content text-center py-12">
                    <div className="w-16 h-16 border-4 border-ember/30 border-t-ember rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--th-charcoal)' }}>Submitting Application...</h3>
                    <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Please wait a moment.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content text-center py-10" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✅</span></div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--th-charcoal)' }}>Application Submitted!</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--th-text-secondary)' }}>Your application for {role.roleTitle} is under review.</p>
                    <button onClick={onClose} className="btn-primary text-sm px-6 py-2">Close</button>
                </div>
            </div>
        );
    }

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--th-input-bg)', border: '1px solid var(--th-border)', color: 'var(--th-text)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--th-text-secondary)', marginBottom: '4px' };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--th-charcoal)' }}>Volunteer Application</h2>
                    <button onClick={onClose} className="text-xl" style={{ color: 'var(--th-text-muted)' }}>&times;</button>
                </div>

                <div className="rounded-xl p-4 mb-5 space-y-2 text-sm" style={{ background: 'var(--th-bg-alt)' }}>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Event</span><span className="font-medium" style={{ color: 'var(--th-text)' }}>{event.title}</span></div>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Role</span><span className="font-medium text-ember">{role.roleTitle}</span></div>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Payment</span><span className="font-medium text-frost">₹{role.paymentAmount}</span></div>
                </div>

                {status === 'error' && (
                    <div className="mb-4 p-3 rounded-xl bg-red-100/50 border border-red-500/30 text-red-600 text-sm flex gap-2 items-center">
                        <span className="font-bold">❌</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 flex-col sm:flex-row gap-4">
                        <div>
                            <label style={labelStyle}>Full Name *</label>
                            <input style={inputStyle} value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address *</label>
                            <input style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Phone Number *</label>
                            <input style={inputStyle} type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="9876543210" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Department *</label>
                            <input style={inputStyle} value={form.department} onChange={e => handleChange('department', e.target.value)} placeholder="e.g. Computer Science" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Year of Study *</label>
                            <select style={inputStyle} value={form.year} onChange={e => handleChange('year', e.target.value)} required>
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Are you available for the entire event? *</label>
                            <select style={inputStyle} value={form.availability} onChange={e => handleChange('availability', e.target.value)} required>
                                <option value="Yes">Yes, I am fully available</option>
                                <option value="Partial">I am partially available</option>
                                <option value="No">No, I have conflicts</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Skills / Past Experience</label>
                        <textarea style={{ ...inputStyle, minHeight: '60px' }} value={form.skills} onChange={e => handleChange('skills', e.target.value)} placeholder="Any relevant skills or previous volunteering experience?" />
                    </div>

                    <div>
                        <label style={labelStyle}>Why do you want to volunteer? *</label>
                        <textarea style={{ ...inputStyle, minHeight: '60px' }} value={form.reason} onChange={e => handleChange('reason', e.target.value)} required />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary flex-1 py-2.5">Submit Application</button>
                        <button type="button" onClick={onClose} className="btn-outline px-6 py-2.5">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
