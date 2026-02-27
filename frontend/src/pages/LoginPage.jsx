import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(form);
        if (result.success) {
            toast.success('Welcome back! 🎉');
            navigate('/trips');
        } else {
            setError(result.message);
        }
    };

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    return (
        <div className="auth-page page-enter">
            <div className="auth-bg-orb" />
            <div className="auth-card card">
                <div className="auth-header">
                    <span className="auth-icon">🚗</span>
                    <h1>Welcome back</h1>
                    <p>Log in to your Trekunity account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" className="form-input"
                            placeholder="you@trekunity.com" value={form.email}
                            onChange={handleChange} required autoComplete="email" />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" className="form-input"
                            placeholder="••••••••" value={form.password}
                            onChange={handleChange} required autoComplete="current-password" />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                        {isLoading ? 'Logging in…' : 'Log in'}
                    </button>
                </form>

                <div className="auth-divider"><span>or continue with</span></div>

                <a href={`${import.meta.env.VITE_API_URL || '/api'}/auth/google`} className="btn btn-ghost w-full">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777L1.24 17.35C3.198 21.302 7.27 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z" />
                        <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z" />
                        <path fill="#FBBC05" d="M5.277 14.314A7.18 7.18 0 0 1 4.909 12c0-.81.119-1.582.355-2.309L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.021z" />
                    </svg>
                    Sign in with Google
                </a>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
