import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLoginUser } from '../services/api';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await adminLoginUser({ email, password });
            login(res.data.token, res.data.user);
            navigate('/admin-dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d2b 100%)' }}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative reveal">
                <div style={{
                    background: 'rgba(20, 20, 50, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    <div className="text-center mb-8">
                        <div style={{
                            width: '72px', height: '72px',
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            borderRadius: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)',
                            fontSize: '32px'
                        }}>🛡️</div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#e2e8f0', marginBottom: '6px' }}>Admin Portal</h1>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Secure access for EventBuzz administrators</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Email Address</label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@eventbuzz.com" required
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Password</label>
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" required
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    background: 'rgba(15, 15, 40, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
                            />
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: error.includes('Unauthorized') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: error.includes('Unauthorized') ? '#fca5a5' : '#fcd34d',
                                fontSize: '0.85rem', padding: '12px 16px', borderRadius: '12px',
                                border: `1px solid ${error.includes('Unauthorized') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{error.includes('Unauthorized') ? '⛔' : '⚠️'}</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                            background: loading ? 'rgba(124, 58, 237, 0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                            marginTop: '4px'
                        }}>
                            {loading ? '⏳ Authenticating...' : '🔐 Admin Sign In'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
