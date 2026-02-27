import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 8) {
            return setError('Password must be at least 8 characters.');
        }
        const result = await register(form);
        if (result.success) {
            toast.success('Account created! Let\'s explore 🌍');
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
                    <h1>Create an account</h1>
                    <p>Join Trekunity and start planning</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input id="name" name="name" type="text" className="form-input"
                            placeholder="Your name" value={form.name}
                            onChange={handleChange} required autoComplete="name" />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" className="form-input"
                            placeholder="you@trekunity.com" value={form.email}
                            onChange={handleChange} required autoComplete="email" />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" className="form-input"
                            placeholder="Min. 8 characters" value={form.password}
                            onChange={handleChange} required autoComplete="new-password" />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
