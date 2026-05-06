import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rentalsApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import './RentalsPage.css';

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const getDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end - start) / 86400000));
};

export default function RentalsPage() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(tomorrow);
    const [maxPrice, setMaxPrice] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const rentalDays = useMemo(() => getDays(startDate, endDate), [startDate, endDate]);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await rentalsApi.getListings({
                location,
                startDate,
                endDate,
                maxPrice: maxPrice || undefined,
                type: vehicleType || undefined,
            });
            setListings(res.data.data);
        } catch (err) {
            setListings([]);
            setMessage(err.response?.data?.message || 'Unable to load rental listings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchListings();
    };

    const handleBook = async (listing) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await rentalsApi.book({ listingId: listing.id, startDate, endDate });
            alert(`Booking request sent to ${listing.host.name}. Total: ₹${listing.pricePerDay * rentalDays}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed. Please try again.');
        }
    };

    return (
        <div className="rentals-container">
            <div className="rentals-hero">
                <div className="hero-content">
                    <h1>Self-Drive Marketplace</h1>
                    <p>Book community-hosted cars inside Trekunity for outer-city trips and weekend escapes.</p>
                    <form className="rental-search" onSubmit={handleSearch}>
                        <LocationAutocomplete
                            placeholder="Search by city..."
                            value={location}
                            onChange={setLocation}
                            onSelect={setLocation}
                        />
                        <button type="submit">Search</button>
                    </form>
                </div>
            </div>

            <div className="rentals-grid-container">
                <div className="rental-market-header">
                    <div>
                        <h2>Available Cars</h2>
                        <p>{rentalDays} day{rentalDays > 1 ? 's' : ''} selected for this booking.</p>
                    </div>
                    <Link to="/host" className="btn btn-ghost">List Your Car</Link>
                </div>

                <form className="rental-filters" onSubmit={handleSearch}>
                    <label>
                        Start
                        <input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} />
                    </label>
                    <label>
                        End
                        <input type="date" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} />
                    </label>
                    <label>
                        Max/day
                        <input type="number" placeholder="₹3000" min="1" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </label>
                    <label>
                        Type
                        <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                            <option value="">All</option>
                            <option value="CAR">Car</option>
                            <option value="BIKE">Bike</option>
                        </select>
                    </label>
                    <button type="submit" className="btn btn-primary">Apply</button>
                </form>

                {message && <div className="rental-message">{message}</div>}

                {loading ? (
                    <div className="loader">Searching for available cars...</div>
                ) : listings.length > 0 ? (
                    <div className="rentals-grid">
                        {listings.map((listing) => {
                            const image = listing.vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=70';
                            const total = listing.pricePerDay * rentalDays;
                            return (
                                <div key={listing.id} className="rental-card">
                                    <div className="car-image">
                                        <img src={image} alt={`${listing.vehicle.make} ${listing.vehicle.model}`} />
                                        <div className="price-tag">₹{listing.pricePerDay}/day</div>
                                    </div>
                                    <div className="car-details">
                                        <h3>{listing.vehicle.make} {listing.vehicle.model}</h3>
                                        <p className="rental-location">{listing.location}</p>
                                        <div className="car-specs">
                                            <span>{listing.vehicle.transmission}</span>
                                            <span>{listing.vehicle.fuelType}</span>
                                            <span>{listing.vehicle.seats} Seats</span>
                                            <span>{listing.vehicle.year}</span>
                                        </div>
                                        <div className="host-info">
                                            {listing.host.avatarUrl
                                                ? <img src={listing.host.avatarUrl} alt={listing.host.name} />
                                                : <div className="host-avatar-placeholder">{listing.host.name[0]}</div>
                                            }
                                            <span>Hosted by {listing.host.name}</span>
                                        </div>
                                        <div className="rental-total">
                                            <span>Total</span>
                                            <strong>₹{total}</strong>
                                        </div>
                                        <button className="rent-btn" onClick={() => handleBook(listing)}>Request Booking</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-rentals">
                        <h3>No cars found</h3>
                        <p>Try another city/date or become the first host for this route.</p>
                        <Link to="/host" className="btn btn-primary">List Your Car</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
