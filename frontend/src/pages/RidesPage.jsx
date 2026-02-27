import React, { useState, useEffect } from 'react';
import './RidesPage.css';
import { ridesApi } from '../api/index.js';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import ServiceLoginModal from '../components/ServiceLoginModal.jsx';

const RidesPage = () => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [type, setType] = useState('LOCAL');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [linkedProviders, setLinkedProviders] = useState([]);

    useEffect(() => {
        fetchLinkedAccounts();
    }, []);

    const fetchLinkedAccounts = async () => {
        try {
            const res = await ridesApi.getLinkedAccounts();
            setLinkedProviders(res.data.data.filter(a => a.isConnected).map(a => a.provider));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        // Requirement: User must login accounts before comparing
        if (linkedProviders.length === 0) {
            setIsModalOpen(true);
            return;
        }

        setLoading(true);
        try {
            const res = await ridesApi.compare({ pickup, dropoff, type });
            setOptions(res.data.data);
            if (res.data.data.length === 0) {
                alert('No rides found for the selected route. Try connecting more services!');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (option) => {
        try {
            await ridesApi.book({
                provider: option.provider,
                vehicleType: option.vehicleType,
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                fare: option.price,
                currency: option.currency,
                type: option.type
            });
            alert(`Succesfully booked ${option.provider} ${option.vehicleType}!`);
            setSelectedRide(null);
        } catch (err) {
            console.error(err);
            alert('Booking failed. Please try again.');
        }
    };

    const handleGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPickup('Current Location');
            });
        }
    };

    const handleConnected = (provider) => {
        setLinkedProviders(prev => [...prev, provider]);
    };

    return (
        <div className="rides-container">
            <div className="rides-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1>Find Your Next Ride</h1>
                        <p>Compare prices from Uber, Ola, Rapido and more instantly.</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(true)}>
                        {linkedProviders.length > 0 ? 'Manage Accounts' : 'Connect Accounts'}
                    </button>
                </div>
            </div>

            <form className="search-box" onSubmit={handleSearch}>
                <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>Pickup Location</label>
                        <button type="button" onClick={handleGPS} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', cursor: 'pointer' }}>📍 Current</button>
                    </div>
                    <LocationAutocomplete
                        placeholder="e.g. Airport, Bangalore"
                        value={pickup}
                        onChange={setPickup}
                        onSelect={setPickup}
                    />
                </div>
                <div className="input-group">
                    <label>Dropoff Location</label>
                    <LocationAutocomplete
                        placeholder="e.g. HSR Layout, Bangalore"
                        value={dropoff}
                        onChange={setDropoff}
                        onSelect={setDropoff}
                    />
                </div>
                <div className="input-group">
                    <label>Trip Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="LOCAL">Local</option>
                        <option value="INTERCITY">Inter-City</option>
                        <option value="OUTERCITY">Outer-City</option>
                    </select>
                </div>
                <button type="submit" className="search-btn" disabled={loading}>
                    {loading ? 'Searching...' : 'Compare Prices'}
                </button>
            </form>

            <div className="results-section">
                {options.length > 0 ? (
                    <div className="options-grid">
                        {options.map((opt, idx) => (
                            <div key={idx} className="ride-card">
                                <div className="provider-info">
                                    <div className={`provider-logo ${opt.provider.toLowerCase()}`}>
                                        {opt.provider[0]}
                                    </div>
                                    <div>
                                        <h3>{opt.provider} {opt.vehicleType}</h3>
                                        <span>{opt.eta} mins away • {opt.capacity} Seats</span>
                                    </div>
                                </div>
                                <div className="price-info">
                                    <div className="amount">₹{opt.price}</div>
                                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                                        <input type="checkbox" required /> I accept the <a href="#">Terms & Conditions</a>
                                    </label>
                                    <button className="book-btn" onClick={() => handleBook(opt)}>Book</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && (
                    <div className="empty-state">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/car-searching-illustration-download-in-svg-png-gif-file-formats--vehicle-magnifying-glass-tax-security-finance-pack-business-illustrations-4796328.png" alt="Search" />
                        <p>{linkedProviders.length === 0 ? 'Connect your accounts to start comparing prices.' : 'Enter your locations to see the best ride options.'}</p>
                    </div>
                )}
            </div>

            <ServiceLoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConnected={handleConnected}
                linkedProviders={linkedProviders}
            />
        </div>
    );
};

export default RidesPage;
