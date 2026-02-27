import React, { useState, useEffect } from 'react';
import './HostDashboard.css';
import axios from 'axios';

const HostDashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        make: '', model: '', year: 2024, type: 'CAR',
        licensePlate: '', seats: 5, fuelType: 'Petrol',
        transmission: 'Automatic'
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('/api/vehicles/my');
            setVehicles(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/vehicles', formData);
            setShowAddForm(false);
            fetchVehicles();
        } catch (err) {
            console.error(err);
            alert('Failed to add vehicle.');
        }
    };

    const handleListForRent = async (vehicleId) => {
        const price = prompt('Enter price per day (INR):', '2000');
        const location = prompt('Enter pickup location:', 'Bangalore');
        if (!price || !location) return;

        try {
            await axios.post('/api/rentals/listings', {
                vehicleId,
                pricePerDay: price,
                location,
                availableFrom: new Date(),
                availableTo: new Date(Date.now() + 30 * 86400000) // 30 days
            });
            alert('Vehicle listed successfully!');
            fetchVehicles();
        } catch (err) {
            console.error(err);
            alert('Failed to list vehicle.');
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
                    <h2>Host Dashboard</h2>
                    <button className="add-v-btn" onClick={() => setShowAddForm(true)}>+ Add Vehicle</button>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <label>Active Listings</label>
                        <div className="value">{vehicles.filter(v => v._count?.listings > 0).length}</div>
                    </div>
                    <div className="stat-card">
                        <label>Total Vehicles</label>
                        <div className="value">{vehicles.length}</div>
                    </div>
                </div>

                <h3>Your Fleet</h3>
                <div className="vehicle-list">
                    {vehicles.map(v => (
                        <div key={v.id} className="v-card">
                            <div className="v-info">
                                <h4>{v.make} {v.model}</h4>
                                <span>{v.licensePlate}</span>
                            </div>
                            <div className="v-actions">
                                {v._count?.listings > 0 ? (
                                    <span className="badge-active">Listed</span>
                                ) : (
                                    <button className="list-btn" onClick={() => handleListForRent(v.id)}>List for Rent</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Add New Vehicle</h3>
                            <form onSubmit={handleAddVehicle}>
                                <input type="text" placeholder="Make (e.g. Toyota)" onChange={e => setFormData({ ...formData, make: e.target.value })} required />
                                <input type="text" placeholder="Model (e.g. Camry)" onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                                <input type="number" placeholder="Year" onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                                <input type="text" placeholder="License Plate" onChange={e => setFormData({ ...formData, licensePlate: e.target.value })} required />
                                <select onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="CAR">Car</option>
                                    <option value="BIKE">Bike</option>
                                </select>
                                <div className="modal-btns">
                                    <button type="submit" className="save-btn">Save Vehicle</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostDashboard;
