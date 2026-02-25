import { useEffect, useState, useCallback } from 'react';
import api from '../api/index.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './AdminPage.css';

const TABS = ['Overview', 'Users', 'Trips'];

export default function AdminPage() {
    const [tab, setTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.data);
        } catch { toast.error('Failed to load stats.'); }
    }, []);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { search, limit: 20 } });
            setUsers(res.data.data);
        } catch { }
        finally { setIsLoading(false); }
    }, [search]);

    const fetchTrips = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/trips', { params: { limit: 20 } });
            setTrips(res.data.data);
        } catch { }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { if (tab === 'Users') fetchUsers(); }, [tab, fetchUsers]);
    useEffect(() => { if (tab === 'Trips') fetchTrips(); }, [tab, fetchTrips]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers((u) => u.filter((u) => u.id !== userId));
            toast.success('User deleted.');
        } catch { toast.error('Failed to delete user.'); }
    };

    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm('Delete this trip?')) return;
        try {
            await api.delete(`/admin/trips/${tripId}`);
            setTrips((t) => t.filter((t) => t.id !== tripId));
            toast.success('Trip deleted.');
        } catch { toast.error('Failed to delete trip.'); }
    };

    return (
        <div className="admin-page page-enter">
            <div className="container">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage users, trips, and platform health.</p>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    {TABS.map((t) => (
                        <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
                    ))}
                </div>

                {/* Overview */}
                {tab === 'Overview' && (
                    <div className="admin-stats">
                        {[
                            { label: 'Total Users', value: stats?.users ?? '—', emoji: '👤' },
                            { label: 'Total Trips', value: stats?.trips ?? '—', emoji: '🗺️' },
                            { label: 'Total Revenue', value: stats ? `$${stats.revenue.toLocaleString()}` : '—', emoji: '💰' },
                        ].map((s) => (
                            <div key={s.label} className="stat-card card">
                                <span className="stat-emoji">{s.emoji}</span>
                                <span className="stat-value gradient-text">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users */}
                {tab === 'Users' && (
                    <div>
                        <div className="admin-search-row">
                            <input type="search" className="form-input" placeholder="🔍 Search users…"
                                value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
                        </div>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {isLoading
                                        ? Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i}><td colSpan="5"><div className="skeleton" style={{ height: 20 }} /></td></tr>
                                        ))
                                        : users.map((u) => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        {u.avatarUrl
                                                            ? <img src={u.avatarUrl} alt={u.name} className="avatar avatar-sm" />
                                                            : <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>{u.name[0]}</div>
                                                        }
                                                        <span>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'ORGANIZER' ? 'badge-info' : 'badge-neutral'}`}>{u.role}</span></td>
                                                <td>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                                                <td>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Trips */}
                {tab === 'Trips' && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr><th>Trip</th><th>Destination</th><th>Organizer</th><th>Members</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}><td colSpan="6"><div className="skeleton" style={{ height: 20 }} /></td></tr>
                                    ))
                                    : trips.map((t) => (
                                        <tr key={t.id}>
                                            <td><strong>{t.title}</strong></td>
                                            <td>{t.destination}</td>
                                            <td>{t.organizer?.name}</td>
                                            <td>{t._count?.members ?? 0} / {t.maxParticipants}</td>
                                            <td><span className="badge badge-neutral">{t.status}</span></td>
                                            <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteTrip(t.id)}>Delete</button></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
