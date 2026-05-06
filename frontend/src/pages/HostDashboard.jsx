import React, { useEffect, useState } from 'react';
import { rentalsApi, vehiclesApi } from '../api/index.js';
import './HostDashboard.css';

const today = new Date().toISOString().slice(0, 10);
const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

const initialVehicleForm = {
    make: '',
    model: '',
    year: 2024,
    type: 'CAR',
    licensePlate: '',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
};

const initialListingForm = {
    vehicleId: '',
    pricePerDay: 2000,
    location: 'Bangalore',
    description: '',
    availableFrom: today,
    availableTo: nextMonth,
};

export default function HostDashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showListingForm, setShowListingForm] = useState(false);
    const [formData, setFormData] = useState(initialVehicleForm);
    const [listingForm, setListingForm] = useState(initialListingForm);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setMessage('');
        try {
            const [vehiclesRes, bookingsRes] = await Promise.all([
                vehiclesApi.getMine(),
                rentalsApi.getHostBookings(),
            ]);
            setVehicles(vehiclesRes.data.data);
            setBookings(bookingsRes.data.data);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Unable to load host dashboard.');
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await vehiclesApi.create(formData);
            setShowAddForm(false);
            setFormData(initialVehicleForm);
            fetchDashboard();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to add vehicle.');
        }
    };

    const openListingForm = (vehicleId) => {
        setListingForm({ ...initialListingForm, vehicleId });
        setShowListingForm(true);
    };

    const handleCreateListing = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await rentalsApi.createListing(listingForm);
            setShowListingForm(false);
            setListingForm(initialListingForm);
            fetchDashboard();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to list vehicle.');
        }
    };

    return (
        <div className="host-container">
            <div className="host-sidebar">
                <div className="sidebar-nav">
                    <button className="active">Dashboard</button>
                    <button>My Vehicles</button>
                    <button>Bookings</button>
                    <button>Earnings</button>
                </div>
            </div>

            <div className="host-main">
                <div className="main-header">
                    <div>
                        <h2>Host Dashboard</h2>
                        <p>List your vehicles and accept self-drive rental requests inside Trekunity.</p>
                    </div>
                    <button className="add-v-btn" onClick={() => setShowAddForm(true)}>+ Add Vehicle</button>
                </div>

                {message && <div className="host-message">{message}</div>}

                <div className="stats-row">
                    <div className="stat-card">
                        <label>Active Listings</label>
                        <div className="value">{vehicles.filter((v) => v._count?.listings > 0).length}</div>
                    </div>
                    <div className="stat-card">
                        <label>Total Vehicles</label>
                        <div className="value">{vehicles.length}</div>
                    </div>
                    <div className="stat-card">
                        <label>Booking Requests</label>
                        <div className="value">{bookings.length}</div>
                    </div>
                </div>

                <section className="host-section">
                    <h3>Your Fleet</h3>
                    <div className="vehicle-list">
                        {vehicles.length === 0 ? (
                            <div className="empty-host-state">Add your first vehicle to start hosting.</div>
                        ) : vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="v-card">
                                <div className="v-info">
                                    <h4>{vehicle.make} {vehicle.model}</h4>
                                    <span>{vehicle.licensePlate} • {vehicle.seats} seats • {vehicle.fuelType}</span>
                                </div>
                                <div className="v-actions">
                                    {vehicle._count?.listings > 0 && <span className="badge-active">Listed</span>}
                                    <button className="list-btn" onClick={() => openListingForm(vehicle.id)}>Create Listing</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="host-section">
                    <h3>Incoming Booking Requests</h3>
                    <div className="booking-list">
                        {bookings.length === 0 ? (
                            <div className="empty-host-state">No booking requests yet.</div>
                        ) : bookings.map((booking) => (
                            <div key={booking.id} className="booking-card">
                                <div>
                                    <h4>{booking.listing.vehicle.make} {booking.listing.vehicle.model}</h4>
                                    <p>{booking.renter.name} • {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</p>
                                </div>
                                <div className="booking-meta">
                                    <strong>₹{booking.totalPrice}</strong>
                                    <span>{booking.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Add New Vehicle</h3>
                            <form onSubmit={handleAddVehicle}>
                                <input type="text" placeholder="Make (e.g. Toyota)" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} required />
                                <input type="text" placeholder="Model (e.g. Innova)" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
                                <input type="number" placeholder="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
                                <input type="text" placeholder="License Plate" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })} required />
                                <input type="number" placeholder="Seats" value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: e.target.value })} required />
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="CAR">Car</option>
                                    <option value="BIKE">Bike</option>
                                </select>
                                <select value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="CNG">CNG</option>
                                    <option value="Electric">Electric</option>
                                </select>
                                <select value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}>
                                    <option value="Automatic">Automatic</option>
                                    <option value="Manual">Manual</option>
                                </select>
                                <div className="modal-btns">
                                    <button type="submit" className="save-btn">Save Vehicle</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showListingForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Create Rental Listing</h3>
                            <form onSubmit={handleCreateListing}>
                                <input type="number" min="1" placeholder="Price per day" value={listingForm.pricePerDay} onChange={(e) => setListingForm({ ...listingForm, pricePerDay: e.target.value })} required />
                                <input type="text" placeholder="Pickup location" value={listingForm.location} onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })} required />
                                <textarea placeholder="Description" value={listingForm.description} onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })} />
                                <label>Available from</label>
                                <input type="date" min={today} value={listingForm.availableFrom} onChange={(e) => setListingForm({ ...listingForm, availableFrom: e.target.value })} required />
                                <label>Available to</label>
                                <input type="date" min={listingForm.availableFrom} value={listingForm.availableTo} onChange={(e) => setListingForm({ ...listingForm, availableTo: e.target.value })} required />
                                <div className="modal-btns">
                                    <button type="submit" className="save-btn">Publish Listing</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowListingForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
