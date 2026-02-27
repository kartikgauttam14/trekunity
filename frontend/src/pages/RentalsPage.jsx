import React, { useState, useEffect } from 'react';
import './RentalsPage.css';
import axios from 'axios';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';

const RentalsPage = () => {
    const [listings, setListings] = useState([]);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/rentals/listings?location=${location}`);
            setListings(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLocation = (city) => {
        setLocation(city);
        // Automatically search on select maybe?
    };

    const handleBook = async (listingId) => {
        try {
            await axios.post('/api/rentals/bookings', {
                listingId,
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000) // Default 1 day from now
            });
            alert('Booking request sent to host!');
        } catch (err) {
            console.error(err);
            alert('Booking failed. Please try again.');
        }
    };

    return (
        <div className="rentals-container">
            <div className="rentals-hero">
                <div className="hero-content">
                    <h1>Self-Drive Collections</h1>
                    <p>Rent a car from people in your community. Verified and Insured.</p>
                    <div className="rental-search">
                        <LocationAutocomplete
                            placeholder="Search by city..."
                            value={location}
                            onChange={setLocation}
                            onSelect={handleSelectLocation}
                        />
                        <button onClick={fetchListings}>Search</button>
                    </div>
                </div>
            </div>

            <div className="rentals-grid-container">
                <h2>Available Cars</h2>
                {loading ? (
                    <div className="loader">Searching for best deals...</div>
                ) : listings.length > 0 ? (
                    <div className="rentals-grid">
                        {listings.map((l) => (
                            <div key={l.id} className="rental-card">
                                <div className="car-image">
                                    <img src={l.vehicle.images[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'} alt={l.vehicle.model} />
                                    <div className="price-tag">₹{l.pricePerDay}/day</div>
                                </div>
                                <div className="car-details">
                                    <h3>{l.vehicle.make} {l.vehicle.model}</h3>
                                    <div className="car-specs">
                                        <span>{l.vehicle.transmission}</span>
                                        <span>{l.vehicle.fuelType}</span>
                                        <span>{l.vehicle.seats} Seats</span>
                                    </div>
                                    <div className="host-info">
                                        <img src={l.host.avatarUrl || 'https://via.placeholder.com/30'} alt={l.host.name} />
                                        <span>Hosted by {l.host.name}</span>
                                    </div>
                                    <button className="rent-btn" onClick={() => handleBook(l.id)}>Rent Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-rentals">
                        <p>No cars found in this location. Try another city!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentalsPage;
