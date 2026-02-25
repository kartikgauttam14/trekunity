import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tripsApi } from '../api/index.js';
import { format } from 'date-fns';
import './TripsPage.css';

const STATUSES = ['', 'OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS = { OPEN: 'Open', FULL: 'Full', IN_PROGRESS: 'Ongoing', COMPLETED: 'Completed', DRAFT: 'Draft' };
const STATUS_BADGE = { OPEN: 'badge-success', FULL: 'badge-warning', IN_PROGRESS: 'badge-info', COMPLETED: 'badge-neutral', DRAFT: 'badge-neutral' };

function TripCard({ trip }) {
    const startDate = trip.startDate ? format(new Date(trip.startDate), 'MMM d') : '';
    const endDate = trip.endDate ? format(new Date(trip.endDate), 'MMM d, yyyy') : '';

    return (
        <Link to={`/trips/${trip.id}`} className="trip-card card">
            <div className="trip-card-img">
                {trip.coverImageUrl
                    ? <img src={trip.coverImageUrl} alt={trip.title} />
                    : <div className="trip-card-img-placeholder">🌍</div>
                }
                <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-neutral'} trip-status-badge`}>
                    {STATUS_LABELS[trip.status] || trip.status}
                </span>
            </div>
            <div className="trip-card-body">
                <div className="trip-card-meta">
                    <span>📍 {trip.destination}</span>
                    {startDate && <span>📅 {startDate} – {endDate}</span>}
                </div>
                <h3 className="trip-card-title">{trip.title}</h3>
                {trip.description && <p className="trip-card-desc">{trip.description.slice(0, 100)}{trip.description.length > 100 && '…'}</p>}
                <div className="trip-card-footer">
                    {trip.organizer && (
                        <div className="flex items-center gap-2">
                            {trip.organizer.avatarUrl
                                ? <img src={trip.organizer.avatarUrl} alt={trip.organizer.name} className="avatar avatar-sm" />
                                : <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>{trip.organizer.name[0]}</div>
                            }
                            <span>{trip.organizer.name}</span>
                        </div>
                    )}
                    {trip._count && (
                        <span className="trip-member-count">👥 {trip._count.members} / {trip.maxParticipants}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function TripsPage() {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchTrips = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await tripsApi.getAll({ search, status, page, limit: 12 });
            setTrips(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
    const handleStatus = (e) => { setStatus(e.target.value); setPage(1); };

    return (
        <div className="trips-page page-enter">
            <div className="container">
                {/* Header */}
                <div className="trips-header">
                    <div>
                        <h1>Explore Trips</h1>
                        <p>Discover group trips and find your next adventure.</p>
                    </div>
                    <Link to="/trips/create" className="btn btn-primary">+ Create Trip</Link>
                </div>

                {/* Filters */}
                <div className="trips-filters">
                    <input type="search" className="form-input search-input"
                        placeholder="🔍  Search destinations, trip names…"
                        value={search} onChange={handleSearch} />
                    <select className="form-input status-select" value={status} onChange={handleStatus}>
                        <option value="">All Statuses</option>
                        {STATUSES.filter(Boolean).map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="trip-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="trip-card-skeleton">
                                <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }} />
                                <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                                    <div className="skeleton" style={{ height: '20px', width: '85%' }} />
                                    <div className="skeleton" style={{ height: '14px', width: '100%' }} />
                                    <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : trips.length === 0 ? (
                    <div className="trips-empty">
                        <span>🌍</span>
                        <h3>No trips found</h3>
                        <p>Try adjusting your filters or <Link to="/trips/create">create the first trip!</Link></p>
                    </div>
                ) : (
                    <div className="trip-grid">
                        {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="pagination">
                        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                        <span>{page} / {pagination.pages}</span>
                        <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
                    </div>
                )}
            </div>
        </div>
    );
}
