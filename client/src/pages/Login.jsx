import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { const res = await loginUser({ email, password }); login(res.data.token, res.data.user); navigate('/dashboard'); }
        catch (err) { setError(err.response?.data?.error || 'Login failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: 'var(--th-hero-grad)' }}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-ember/8 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-frost/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>
            <div className="w-full max-w-md relative reveal">
                <div className="glass-card p-8 sm:p-10 hover:!transform-none">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-ember to-ember-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-ember/20"><span className="text-3xl">🔑</span></div>
                        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--th-charcoal)' }}>Welcome Back</h1>
                        <p className="text-sm mt-1.5" style={{ color: 'var(--th-text-secondary)' }}>Sign in to your EventBuzz account</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div><label className="block text-sm font-semibold text-text mb-1.5">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required /></div>
                        <div><label className="block text-sm font-semibold text-text mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required /></div>
                        {error && <div className="flex items-center gap-2 bg-ember-50 text-ember text-sm px-4 py-3 rounded-xl border border-ember/15"><span>⚠️</span>{error}</div>}
                        <button type="submit" disabled={loading} className="btn-primary w-full !mt-6 !py-3.5 text-base">{loading ? '⏳ Signing in...' : '🚀 Sign In'}</button>
                    </form>
                    <p className="text-center text-sm text-text-secondary mt-7">Don't have an account? <Link to="/register" className="text-ember font-semibold hover:underline">Create one →</Link></p>
                    <div className="mt-7 p-4 bg-gradient-to-br from-sand to-ember-50/50 rounded-xl border border-border-light text-center">
                        <Link to="/admin-login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--th-text-muted)' }}>🛡️ Admin Login →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
