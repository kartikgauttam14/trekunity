import React, { useState, useEffect } from 'react';
import './VerificationPage.css';
import axios from 'axios';

const VerificationPage = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('/api/verifications/status');
            setStatus(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDigiLocker = async () => {
        // Mocking DigiLocker OAuth flow
        alert('Redirecting to DigiLocker...');
        try {
            await axios.post('/api/verifications/submit', {
                documentType: 'DL',
                digiLockerId: 'VERIFIED_DL_' + Math.random().toString(36).substr(2, 5),
                documentNumber: ''
            });
            await axios.post('/api/verifications/submit', {
                documentType: 'AADHAAR',
                digiLockerId: 'VERIFIED_AD_' + Math.random().toString(36).substr(2, 5),
                documentNumber: ''
            });
            fetchStatus();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="verify-container">
            <div className="verify-card">
                <div className="verify-icon">🛡️</div>
                <h1>Identity Verification</h1>
                <p>To list or rent vehicles, we need to verify your identity using DigiLocker.</p>

                <div className="status-badge">
                    {status?.isFullyVerified ? (
                        <span className="verified">Full Access Verified</span>
                    ) : (
                        <span className="pending">Verification Required</span>
                    )}
                </div>

                <div className="verification-steps">
                    <div className={`step ${status?.verifications?.some(v => v.documentType === 'AADHAAR') ? 'done' : ''}`}>
                        <div className="step-num">1</div>
                        <div className="step-text">
                            <strong>Aadhaar Verification</strong>
                            <span>Required for KYC</span>
                        </div>
                    </div>
                    <div className={`step ${status?.verifications?.some(v => v.documentType === 'DL') ? 'done' : ''}`}>
                        <div className="step-num">2</div>
                        <div className="step-text">
                            <strong>Driving License</strong>
                            <span>Required for renting/hosting</span>
                        </div>
                    </div>
                </div>

                {!status?.isFullyVerified && (
                    <button className="digilocker-btn" onClick={handleDigiLocker}>
                        <img src="https://www.digilocker.gov.in/assets/img/logo.png" alt="DigiLocker" />
                        Verify with DigiLocker
                    </button>
                )}

                <p className="privacy-note">
                    Your data is stored securely and only used for verification purposes as per our privacy policy.
                </p>
            </div>
        </div>
    );
};

export default VerificationPage;
