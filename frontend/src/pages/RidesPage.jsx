import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RidesPage.css';
import { ridesApi } from '../api/index.js';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import ServiceLoginModal from '../components/ServiceLoginModal.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function RidesPage() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropoffCoords, setDropoffCoords] = useState(null);
    const [type, setType] = useState('LOCAL');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [linkedProviders, setLinkedProviders] = useState([]);
    const [providerMessage, setProviderMessage] = useState('');

    useEffect(() => {
        const fetchLinkedAccounts = async () => {
            try {
                const res = await ridesApi.getLinkedAccounts();
                setLinkedProviders(res.data.data.filter((a) => a.isConnected).map((a) => a.provider));
            } catch (err) {
                console.error(err);
            }
        };

        if (user) fetchLinkedAccounts();
    }, [user]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (!user) {
            navigate('/login');
            return;
        }

        if (!pickup || !dropoff) {
            alert('Please enter pickup and dropoff locations.');
            return;
        }

        if (!pickupCoords || !dropoffCoords) {
            alert('Real comparison requires map coordinates. Select locations from a configured Places autocomplete before comparing.');
            return;
        }

        if (linkedProviders.length === 0) {
            setIsModalOpen(true);
            return;
        }

        setLoading(true);
        setProviderMessage('');
        try {
            const res = await ridesApi.compare({
                pickup,
                dropoff,
                pickupLat: pickupCoords.lat,
                pickupLng: pickupCoords.lng,
                dropoffLat: dropoffCoords.lat,
                dropoffLng: dropoffCoords.lng,
                type,
            });
            setOptions(res.data.data);
        } catch (err) {
            setOptions([]);
            setProviderMessage(err.response?.data?.message || 'Real provider comparison failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (option) => {
        try {
            await ridesApi.book({
                provider: option.provider,
                providerProductId: option.providerProductId,
                vehicleType: option.vehicleType,
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                fare: option.price,
                currency: option.currency,
                type: option.type,
            });
            alert(`Booking requested for ${option.provider} ${option.vehicleType}.`);
        } catch (err) {
            alert(err.response?.data?.message || 'Real booking failed.');
        }
    };

    const handleGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPickup('Current Location');
                setPickupCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    };

    const handleConnected = (provider) => {
        setLinkedProviders((prev) => prev.includes(provider) ? prev : [...prev, provider]);
    };

    return (
        <div className="rides-container">
            <div className="rides-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1>Find Your Next Ride</h1>
                        <p>Real provider comparison for Uber, Ola, Rapido, and Zoomcar after official API setup.</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => user ? setIsModalOpen(true) : navigate('/login')}>
                        {linkedProviders.length > 0 ? 'Manage Providers' : 'Connect Providers'}
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
                        onChange={(value) => { setPickup(value); setPickupCoords(null); }}
                        onSelect={(location) => {
                            setPickup(location.label || location);
                            setPickupCoords(location.lat ? { lat: location.lat, lng: location.lng } : null);
                        }}
                    />
                </div>
                <div className="input-group">
                    <label>Dropoff Location</label>
                    <LocationAutocomplete
                        placeholder="e.g. Mysore, Coorg, HSR Layout"
                        value={dropoff}
                        onChange={(value) => { setDropoff(value); setDropoffCoords(null); }}
                        onSelect={(location) => {
                            setDropoff(location.label || location);
                            setDropoffCoords(location.lat ? { lat: location.lat, lng: location.lng } : null);
                        }}
                    />
                </div>
                <div className="input-group">
                    <label>Trip Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="LOCAL">Local</option>
                        <option value="INTERCITY">Inter-City</option>
                        <option value="OUTERCITY">Outer-City / Self-Drive</option>
                    </select>
                </div>
                <button type="submit" className="search-btn" disabled={loading}>
                    {loading ? 'Searching...' : 'Compare Prices'}
                </button>
            </form>

            {providerMessage && (
                <div className="provider-message">
                    {providerMessage}
                </div>
            )}

            <div className="results-section">
                {options.length > 0 ? (
                    <div className="options-grid">
                        {options.map((opt, idx) => (
                            <div key={`${opt.provider}-${opt.vehicleType}-${idx}`} className="ride-card">
                                <div className="provider-info">
                                    <div className={`provider-logo ${opt.provider.toLowerCase()}`}>
                                        {opt.provider[0]}
                                    </div>
                                    <div>
                                        <h3>{opt.provider} {opt.vehicleType}</h3>
                                        <span>{opt.eta ? `${opt.eta} mins away` : 'ETA unavailable'} • {opt.capacity || '-'} Seats</span>
                                    </div>
                                </div>
                                <div className="price-info">
                                    <div className="amount">{opt.price ? `₹${opt.price}` : 'Provider fare'}</div>
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
                        <p>{linkedProviders.length === 0 ? 'Connect a real provider account after official API setup.' : 'Enter mapped pickup and dropoff locations to see real provider options.'}</p>
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
}
