import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
    const { id } = useParams();
    const { user: currentUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', bio: '' });
    const [isSaving, setIsSaving] = useState(false);

    const isOwn = currentUser?.id === id;

    useEffect(() => {
        (async () => {
            try {
                const [profileRes, tripsRes] = await Promise.all([
                    usersApi.getById(id),
                    usersApi.getTrips(id),
                ]);
                setProfile(profileRes.data.data);
                setTrips(tripsRes.data.data || []);
                setEditForm({ name: profileRes.data.data.name, bio: profileRes.data.data.bio || '' });
            } catch { }
            finally { setIsLoading(false); }
        })();
    }, [id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await usersApi.update(id, editForm);
            setProfile((p) => ({ ...p, ...res.data.data }));
            setEditing(false);
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile.');
        } finally { setIsSaving(false); }
    };

    if (isLoading) return (
        <div className="profile-page page-enter">
            <div className="container">
                <div className="profile-header skeleton-header">
                    <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div className="skeleton" style={{ height: 24, width: '30%' }} />
                        <div className="skeleton" style={{ height: 16, width: '50%' }} />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!profile) return <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>User not found.</div>;

    return (
        <div className="profile-page page-enter">
            <div className="container">
                {/* Profile header */}
                <div className="profile-header card">
                    <div className="profile-avatar-wrap">
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt={profile.name} className="avatar avatar-xl" />
                            : <div className="avatar-placeholder avatar-xl" style={{ fontSize: '2rem' }}>{profile.name[0]}</div>
                        }
                    </div>
                    <div className="profile-info">
                        {editing ? (
                            <div className="edit-form">
                                <input className="form-input" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" />
                                <textarea className="form-input" rows="3" value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Bio (optional)" />
                                <div className="flex gap-3">
                                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="profile-name-row">
                                    <h1>{profile.name}</h1>
                                    <span className={`badge ${profile.role === 'ADMIN' ? 'badge-danger' : profile.role === 'ORGANIZER' ? 'badge-info' : 'badge-neutral'}`}>{profile.role}</span>
                                </div>
                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                                <p className="profile-joined">Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</p>
                                {isOwn && <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }} onClick={() => setEditing(true)}>✏️ Edit Profile</button>}
                            </>
                        )}
                    </div>
                </div>

                {/* Trips section */}
                <div className="profile-trips">
                    <h2>Trips ({trips.length})</h2>
                    {trips.length === 0
                        ? <p className="text-muted">No trips yet.</p>
                        : (
                            <div className="profile-trip-grid">
                                {trips.map((trip) => (
                                    <Link key={trip.id} to={`/trips/${trip.id}`} className="profile-trip-card card">
                                        <div className="profile-trip-img">
                                            {trip.coverImageUrl
                                                ? <img src={trip.coverImageUrl} alt={trip.title} />
                                                : <div className="profile-trip-placeholder">🚗</div>
                                            }
                                        </div>
                                        <div className="profile-trip-info">
                                            <strong>{trip.title}</strong>
                                            <span>📍 {trip.destination}</span>
                                            {trip.startDate && <span>📅 {format(new Date(trip.startDate), 'MMM yyyy')}</span>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
