import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsApi } from '../api/index.js';
import toast from 'react-hot-toast';
import './CreateTripPage.css';

const STEPS = ['Details', 'Dates & Size', 'Review'];

export default function CreateTripPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', destination: '',
        startDate: '', endDate: '', maxParticipants: 10,
        budgetEstimate: '', isPublic: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await tripsApi.create(form);
            toast.success('Trip created! 🎉');
            navigate(`/trips/${res.data.data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create trip.');
        } finally { setIsLoading(false); }
    };

    return (
        <div className="create-trip-page page-enter">
            <div className="container">
                <div className="create-trip-header">
                    <h1>Create a New Trip</h1>
                    <p>Set up your group trip in just a few steps.</p>
                </div>

                {/* Stepper */}
                <div className="stepper">
                    {STEPS.map((s, i) => (
                        <div key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="step-dot">{i < step ? '✓' : i + 1}</div>
                            <span>{s}</span>
                        </div>
                    ))}
                </div>

                {/* Form card */}
                <div className="create-trip-card card">
                    {step === 0 && (
                        <div className="form-step">
                            <h2>Trip details</h2>
                            <div className="form-group">
                                <label className="form-label">Trip Title *</label>
                                <input name="title" type="text" className="form-input"
                                    placeholder="e.g. Bali Adventure 2025" value={form.title} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Destination *</label>
                                <input name="destination" type="text" className="form-input"
                                    placeholder="e.g. Bali, Indonesia" value={form.destination} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea name="description" className="form-input" rows="4"
                                    placeholder="What makes this trip special?" value={form.description} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label checkbox-label">
                                    <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} />
                                    Public trip (visible to everyone)
                                </label>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="form-step">
                            <h2>Dates & group size</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input name="startDate" type="date" className="form-input"
                                        value={form.startDate} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date *</label>
                                    <input name="endDate" type="date" className="form-input"
                                        value={form.endDate} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Max Participants</label>
                                    <input name="maxParticipants" type="number" min="2" max="100" className="form-input"
                                        value={form.maxParticipants} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Budget Estimate (USD/person)</label>
                                    <input name="budgetEstimate" type="number" min="0" className="form-input"
                                        placeholder="e.g. 1500" value={form.budgetEstimate} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-step review-step">
                            <h2>Review your trip</h2>
                            <div className="review-grid">
                                <div className="review-item">
                                    <label>Title</label>
                                    <strong>{form.title || '—'}</strong>
                                </div>
                                <div className="review-item">
                                    <label>Destination</label>
                                    <strong>{form.destination || '—'}</strong>
                                </div>
                                <div className="review-item">
                                    <label>Dates</label>
                                    <strong>{form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : '—'}</strong>
                                </div>
                                <div className="review-item">
                                    <label>Participants</label>
                                    <strong>Max {form.maxParticipants}</strong>
                                </div>
                                <div className="review-item">
                                    <label>Budget / person</label>
                                    <strong>{form.budgetEstimate ? `$${form.budgetEstimate}` : 'Not set'}</strong>
                                </div>
                                <div className="review-item">
                                    <label>Visibility</label>
                                    <strong>{form.isPublic ? 'Public' : 'Private'}</strong>
                                </div>
                            </div>
                            {form.description && (
                                <div className="review-description">
                                    <label>Description</label>
                                    <p>{form.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Nav buttons */}
                    <div className="form-nav">
                        {step > 0 && (
                            <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>← Back</button>
                        )}
                        {step < STEPS.length - 1
                            ? <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}
                                disabled={!form.title || !form.destination}>Next →</button>
                            : <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading || !form.startDate || !form.endDate}>
                                {isLoading ? 'Creating…' : '🚀 Create Trip'}
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
