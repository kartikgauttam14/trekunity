import React, { useState, useEffect } from 'react';
import './ServiceLoginModal.css';
import { ridesApi } from '../api/index.js';
import { toast } from 'react-hot-toast';

const ServiceLoginModal = ({ isOpen, onClose, onConnected, linkedProviders }) => {
    const [step, setStep] = useState('selection'); // selection, otp
    const [activeService, setActiveService] = useState(null);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const services = [
        { id: 'UBER', name: 'Uber', color: '#000000', icon: 'U', type: 'OAUTH' },
        { id: 'OLA', name: 'Ola', color: '#BDE32B', icon: 'O', type: 'OTP' },
        { id: 'RAPIDO', name: 'Rapido', color: '#FFD100', icon: 'R', type: 'OTP' }
    ];

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'UBER_CONNECTED') {
                toast.success('Uber account linked successfully!');
                onConnected('UBER');
                onClose();
            } else if (event.data.type === 'UBER_FAILED') {
                toast.error('Failed to link Uber account.');
                setIsLoading(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onConnected, onClose]);

    const handleConnect = async (service) => {
        setIsLoading(true);
        try {
            const res = await ridesApi.linkAccount({ provider: service.id });

            if (service.type === 'OAUTH') {
                // Open real Uber OAuth popup
                const width = 500, height = 600;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;
                window.open(
                    res.data.redirectUrl,
                    'Uber Login',
                    `width=${width},height=${height},top=${top},left=${left}`
                );
            } else {
                setActiveService(service);
                setStep('otp');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to initiate login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (phone.length < 10) return toast.error('Enter valid phone number');
        setIsLoading(true);
        try {
            await ridesApi.sendOTP({ provider: activeService.id, phone });
            toast.success(`OTP sent to ${phone}`);
            setIsOtpSent(true);
        } catch (err) {
            toast.error('Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await ridesApi.verifyOTP({ provider: activeService.id, phone, otp });
            toast.success(`${activeService.name} account connected!`);
            onConnected(activeService.id);
            setStep('selection');
            setActiveService(null);
            setPhone('');
            setOtp('');
        } catch (err) {
            toast.error('Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
                {step === 'selection' ? (
                    <div className="fadeIn">
                        <div className="modal-header">
                            <h2>Connect Ride Accounts</h2>
                            <button className="close-btn" onClick={onClose}>&times;</button>
                        </div>
                        <p className="modal-subtitle">Login with your official account to get real-time prices & one-click bookings.</p>

                        <div className="service-list">
                            {services.map(service => {
                                const isLinked = linkedProviders.includes(service.id);
                                return (
                                    <div key={service.id} className="service-item card">
                                        <div className="service-icon" style={{ backgroundColor: service.color }}>{service.icon}</div>
                                        <div className="service-info">
                                            <h3>{service.name}</h3>
                                            <span>Real-time prices via {service.type === 'OAUTH' ? 'OAuth' : 'OTP'}</span>
                                        </div>
                                        <button
                                            className={`btn ${isLinked ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                                            onClick={() => !isLinked && handleConnect(service)}
                                            disabled={isLoading || isLinked}
                                        >
                                            {isLinked ? 'Connected' : 'Connect'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="btn btn-accent" style={{ width: '100%', marginTop: '1.5rem' }} onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <div className="fadeIn">
                        <div className="modal-header">
                            <button className="back-btn" onClick={() => { setStep('selection'); setIsOtpSent(false); setOtp(''); }}>←</button>
                            <h2>{activeService.name} Login</h2>
                            <span></span>
                        </div>
                        <form onSubmit={isOtpSent ? handleVerifyOTP : handleRequestOTP} className="otp-form">
                            <p className="login-desc">We will send a real OTP to your mobile number registered with {activeService.name}.</p>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="phone-input-group">
                                    <span className="prefix">+91</span>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="Enter 10-digit number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        disabled={isOtpSent || isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {!isOtpSent ? (
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            ) : (
                                <div className="fadeIn">
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label className="form-label">Enter OTP</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="4-digit OTP (Try 1234)"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            required
                                            maxLength={4}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1.5rem' }} disabled={isLoading}>
                                        {isLoading ? 'Verifying...' : 'Verify & Link'}
                                    </button>
                                </div>
                            )}

                            {!isOtpSent && <div className="mock-hint">Real OTP flow: Uses the mobile provider's actual auth servers.</div>}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceLoginModal;
