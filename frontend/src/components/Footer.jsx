import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="brand-link font-display">Trekunity</Link>
                        <p>The all-in-one platform for planning, splitting expenses, and enjoying group travel.</p>
                    </div>

                    <div className="footer-links-group">
                        <h4>Platform</h4>
                        <ul>
                            <li><Link to="/trips">All Trips</Link></li>
                            <li><Link to="/rides">Rides</Link></li>
                            <li><Link to="/rentals">Rentals</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><a href="mailto:hello@trekunity.com">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="footer-newsletter">
                        <h4>Stay Updated</h4>
                        <p>Join our newsletter for travel tips.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Email address" className="form-input" />
                            <button type="submit" className="btn btn-primary btn-sm">Join</button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Trekunity Inc. All rights reserved.</p>
                    <div className="social-links">
                        {/* Placeholder icons or text links */}
                        <a href="#">Twitter</a>
                        <a href="#">Instagram</a>
                        <a href="#">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
