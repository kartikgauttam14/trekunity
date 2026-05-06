import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import './HomePage.css';

const HERO_STATS = [
    { value: 'Plan', label: 'Itineraries together' },
    { value: 'Split', label: 'Expenses clearly' },
    { value: 'Book', label: 'Rides and rentals' },
];

const FEATURES = [
    { emoji: '🗺️', title: 'Visual Itinerary Builder', desc: 'Drag-and-drop day planner to schedule every moment of your trip.' },
    { emoji: '💬', title: 'Live Group Chat', desc: 'Real-time chat with your travel crew — no extra apps needed.' },
    { emoji: '💰', title: 'Smart Expense Splitting', desc: 'Track expenses and auto-split costs so no one overpays.' },
    { emoji: '🗳️', title: 'Group Polls', desc: 'Vote on destinations, activities, and restaurants democratically.' },
    { emoji: '🔔', title: 'Instant Notifications', desc: 'Stay in sync with real-time updates on trip changes.' },
    { emoji: '🔐', title: 'Secure Payments', desc: 'Pay your share securely with Stripe integration.' },
];

export default function HomePage() {
    const user = useAuthStore((s) => s.user);

    return (
        <div className="home page-enter">
            {/* Hero */}
            <section className="hero">
                <div className="container home-hero-content">
                    <div className="hero-copy">
                        <p className="hero-tag">Group trips, rides, rentals</p>
                        <h1 className="hero-title">
                            Travel Together,
                            <span className="gradient-text"> Better</span>
                        </h1>
                        <p className="hero-subtitle">
                            Plan the route, coordinate the crew, compare rides, rent cars, and keep shared costs simple from the first idea to the last ride home.
                        </p>
                        <div className="hero-ctas">
                            {user
                                ? <Link to="/trips" className="btn btn-primary btn-lg">Browse Trips</Link>
                                : <>
                                    <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                                    <Link to="/trips" className="btn btn-ghost btn-lg">Explore Trips</Link>
                                </>
                            }
                        </div>
                    </div>

                    <div className="hero-panel" aria-label="Travel planning preview">
                        <img
                            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                            alt="Friends planning a trip near a scenic road"
                        />
                        <div className="hero-panel-overlay">
                            <span>Weekend Goa Run</span>
                            <strong>4 travelers synced</strong>
                        </div>
                    </div>

                    <div className="hero-stats" aria-label="Trekunity planning highlights">
                        {HERO_STATS.map((s) => (
                            <div key={s.label} className="hero-stat">
                                <span className="hero-stat-value gradient-text">{s.value}</span>
                                <span className="hero-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Everything your group needs</h2>
                    <p className="section-subtitle">One platform to plan, communicate, and travel — together.</p>
                    <div className="features-grid">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="feature-card card">
                                <div className="feature-icon">{f.emoji}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-section">
                <div className="container cta-inner">
                    <h2>Ready to start your next adventure?</h2>
                    <p>Join thousands of travelers who plan smarter with Trekunity.</p>
                    <Link to={user ? '/trips/create' : '/register'} className="btn btn-primary btn-lg">
                        {user ? 'Create a Trip' : 'Join for Free'}
                    </Link>
                </div>
            </section>
        </div>
    );
}
