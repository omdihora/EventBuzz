import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
        if (form.password.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true);
        try { const res = await registerUser({ name: form.name, email: form.email, password: form.password }); login(res.data.token, res.data.user); navigate('/dashboard'); }
        catch (err) { setError(err.response?.data?.error || 'Registration failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: 'var(--th-hero-grad)' }}>
            <div className="absolute top-10 left-10 w-80 h-80 bg-frost/8 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-ember/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="w-full max-w-md relative reveal">
                <div className="glass-card p-8 sm:p-10 hover:!transform-none">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-frost to-frost-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-frost/20"><span className="text-3xl">✨</span></div>
                        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--th-charcoal)' }}>Create Account</h1>
                        <p className="text-sm mt-1.5" style={{ color: 'var(--th-text-secondary)' }}>Join EventBuzz as a student</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-semibold text-text mb-1.5">Full Name</label><input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required /></div>
                        <div><label className="block text-sm font-semibold text-text mb-1.5">Email Address</label><input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" required /></div>
                        <div><label className="block text-sm font-semibold text-text mb-1.5">Password</label><input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" required /></div>
                        <div><label className="block text-sm font-semibold text-text mb-1.5">Confirm Password</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field" placeholder="Repeat password" required /></div>
                        {error && <div className="flex items-center gap-2 bg-ember-50 text-ember text-sm px-4 py-3 rounded-xl border border-ember/15"><span>⚠️</span>{error}</div>}
                        <button type="submit" disabled={loading} className="btn-primary w-full !mt-6 !py-3.5 text-base">{loading ? '⏳ Creating...' : '🚀 Create Account'}</button>
                    </form>
                    <p className="text-center text-sm text-text-secondary mt-7">Already have an account? <Link to="/login" className="text-ember font-semibold hover:underline">Sign in →</Link></p>
                </div>
            </div>
        </div>
    );
}
