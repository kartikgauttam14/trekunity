import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore.js';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TripsPage from './pages/TripsPage.jsx';
import TripDetailPage from './pages/TripDetailPage.jsx';
import CreateTripPage from './pages/CreateTripPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import RidesPage from './pages/RidesPage.jsx';
import RentalsPage from './pages/RentalsPage.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import VerificationPage from './pages/VerificationPage.jsx';

const PrivateRoute = ({ children }) => {
    const user = useAuthStore((s) => s.user);
    return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const user = useAuthStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
    return children;
};

export default function App() {
    const fetchMe = useAuthStore((s) => s.fetchMe);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/trips" element={<TripsPage />} />
                    <Route path="/trips/:id" element={<TripDetailPage />} />
                    <Route path="/trips/create" element={<PrivateRoute><CreateTripPage /></PrivateRoute>} />
                    <Route path="/profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="/rides" element={<RidesPage />} />
                    <Route path="/rentals" element={<RentalsPage />} />
                    <Route path="/host" element={<PrivateRoute><HostDashboard /></PrivateRoute>} />
                    <Route path="/verify" element={<PrivateRoute><VerificationPage /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}
