import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripsApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './TripDetailPage.css';

const STATUS_BADGE = { OPEN: 'badge-success', FULL: 'badge-warning', IN_PROGRESS: 'badge-info', COMPLETED: 'badge-neutral', DRAFT: 'badge-neutral' };

export default function TripDetailPage() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        (async () => {
            try {
                const res = await tripsApi.getById(id);
                setTrip(res.data.data);
            } catch { navigate('/trips'); }
            finally { setIsLoading(false); }
        })();
    }, [id, navigate]);

    const handleJoin = async () => {
        if (!user) return navigate('/login');
        setIsJoining(true);
        try {
            await tripsApi.join(id);
            toast.success('Join request sent! Waiting for organizer approval 🎉');
            const res = await tripsApi.getById(id);
            setTrip(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join trip.');
        } finally { setIsJoining(false); }
    };

    if (isLoading) return (
        <div className="trip-detail-loading">
            <div className="skeleton" style={{ height: '320px', borderRadius: 0 }} />
            <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
                <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: 'var(--space-4)' }} />
                <div className="skeleton" style={{ height: '20px', width: '40%' }} />
            </div>
        </div>
    );

    if (!trip) return null;

    const isOrganizer = user?.id === trip.organizerId;
    const isMember = trip.members?.some((m) => m.userId === user?.id);
    const dayGroups = trip.itineraryItems?.reduce((acc, item) => {
        const day = `Day ${item.dayNumber}`;
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {});

    return (
        <div className="trip-detail page-enter">
            {/* Hero */}
            <div className="trip-detail-hero">
                {trip.coverImageUrl
                    ? <img src={trip.coverImageUrl} alt={trip.title} className="trip-detail-cover" />
                    : <div className="trip-detail-cover-placeholder">🌍</div>
                }
                <div className="trip-detail-hero-overlay" />
                <div className="container trip-detail-hero-content">
                    <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-neutral'}`}>{trip.status}</span>
                    <h1>{trip.title}</h1>
                    <div className="trip-hero-meta">
                        <span>📍 {trip.destination}</span>
                        {trip.startDate && <span>📅 {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>}
                        <span>👥 {trip.members?.length || 0} / {trip.maxParticipants} members</span>
                        {trip.budgetEstimate && <span>💰 ~${trip.budgetEstimate.toLocaleString()} / person</span>}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="container trip-detail-body">
                {/* Sidebar (organizer + join) */}
                <aside className="trip-detail-sidebar">
                    <div className="card sidebar-card">
                        <h3>Organized by</h3>
                        <Link to={`/profile/${trip.organizer?.id}`} className="organizer-info">
                            {trip.organizer?.avatarUrl
                                ? <img src={trip.organizer.avatarUrl} alt={trip.organizer.name} className="avatar avatar-lg" />
                                : <div className="avatar-placeholder avatar-lg" style={{ fontSize: '1.4rem' }}>{trip.organizer?.name[0]}</div>
                            }
                            <div>
                                <strong>{trip.organizer?.name}</strong>
                                {trip.organizer?.bio && <p>{trip.organizer.bio.slice(0, 60)}…</p>}
                            </div>
                        </Link>

                        {!isOrganizer && !isMember && trip.status === 'OPEN' && (
                            <button className="btn btn-primary w-full" onClick={handleJoin} disabled={isJoining}>
                                {isJoining ? 'Sending request…' : '🚗 Request to Join'}
                            </button>
                        )}
                        {isOrganizer && <Link to={`/trips/${id}/edit`} className="btn btn-ghost w-full">✏️ Edit Trip</Link>}
                        {isMember && <span className="badge badge-success">✓ You're a member</span>}
                    </div>

                    {/* Members */}
                    <div className="card sidebar-card">
                        <h3>Members ({trip.members?.length || 0})</h3>
                        <div className="members-list">
                            {trip.members?.slice(0, 8).map((m) => (
                                <Link key={m.userId} to={`/profile/${m.userId}`} className="member-chip">
                                    {m.user?.avatarUrl
                                        ? <img src={m.user.avatarUrl} alt={m.user.name} className="avatar avatar-sm" />
                                        : <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>{m.user?.name[0]}</div>
                                    }
                                    <span>{m.user?.name}</span>
                                </Link>
                            ))}
                            {(trip.members?.length || 0) > 8 && <span className="text-muted">+{trip.members.length - 8} more</span>}
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="trip-detail-main">
                    {/* Tabs */}
                    <div className="trip-tabs">
                        {['overview', 'itinerary', 'announcements'].map((tab) => (
                            <button key={tab} className={`trip-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="tab-content">
                            <h2>About this trip</h2>
                            <p className="trip-description">{trip.description || 'No description provided.'}</p>
                        </div>
                    )}

                    {activeTab === 'itinerary' && (
                        <div className="tab-content">
                            <h2>Itinerary</h2>
                            {!dayGroups || Object.keys(dayGroups).length === 0
                                ? <p className="text-muted">No itinerary items yet.</p>
                                : Object.entries(dayGroups).map(([day, items]) => (
                                    <div key={day} className="itinerary-day">
                                        <h3 className="day-label">{day}</h3>
                                        <div className="itinerary-items">
                                            {items.map((item) => (
                                                <div key={item.id} className="itinerary-item card">
                                                    <div className="itinerary-item-time">{item.startTime || '—'}</div>
                                                    <div className="itinerary-item-content">
                                                        <strong>{item.title}</strong>
                                                        {item.location && <span>📍 {item.location}</span>}
                                                        {item.description && <p>{item.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="tab-content">
                            <h2>Announcements</h2>
                            {!trip.announcements?.length
                                ? <p className="text-muted">No announcements yet.</p>
                                : trip.announcements.map((a) => (
                                    <div key={a.id} className="announcement card">
                                        <div className="flex justify-between items-center">
                                            <strong>{a.title}</strong>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{format(new Date(a.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                        <p>{a.content}</p>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
