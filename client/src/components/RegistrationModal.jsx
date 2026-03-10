import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPaymentOrder, verifyPayment } from '../services/api';

export default function RegistrationModal({ event, onClose, onSuccess }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [step, setStep] = useState('form');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!phone || phone.length < 10) { setError('Enter a valid phone number.'); return; }
        setStep('processing');
        setError('');

        try {
            // 1. Create Order
            const { data } = await createPaymentOrder({ eventId: event.id, phone });

            if (data.skipPayment) {
                // Free event
                setStep('success');
                onSuccess && onSuccess();
                return;
            }

            // 2. Initialize Razorpay Checkout
            const options = {
                key: data.keyId,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'EventBuzz',
                description: `Ticket for ${event.title}`,
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        setStep('processing'); // Show processing again while verifying
                        await verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            registrationId: data.registrationId,
                            eventId: event.id
                        });
                        setStep('success');
                        onSuccess && onSuccess();
                    } catch (verifyErr) {
                        setError(verifyErr.response?.data?.error || 'Payment verification failed.');
                        setStep('error');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: phone
                },
                theme: {
                    color: '#E8725C' // Ember color
                },
                modal: {
                    ondismiss: function () {
                        setStep('form');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(response.error.description || 'Payment Failed');
                setStep('error');
            });
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.error || 'Could not initiate payment.');
            setStep('error');
        }
    };

    if (step === 'processing') return (
        <div className="modal-overlay">
            <div className="modal-content text-center py-12">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--th-charcoal)' }}>Processing Payment...</h3>
                <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Completing your transaction...</p>
            </div>
        </div>
    );

    if (step === 'success') return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content text-center py-10" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✅</span></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--th-charcoal)' }}>Registration Successful!</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--th-text-secondary)' }}>Your QR ticket has been generated.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/dashboard/my-tickets')} className="btn-primary text-sm">View My Tickets</button>
                    <button onClick={onClose} className="btn-outline text-sm">Close</button>
                </div>
            </div>
        </div>
    );

    if (step === 'error') return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content text-center py-10" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">❌</span></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--th-charcoal)' }}>Registration Failed</h3>
                <p className="text-red-500 text-sm mb-6">{error}</p>
                <button onClick={onClose} className="btn-outline text-sm">Close</button>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--th-charcoal)' }}>Register for Event</h2>
                <p className="text-sm mb-5" style={{ color: 'var(--th-text-secondary)' }}>{event.title}</p>
                <div className="rounded-xl p-4 mb-5 space-y-1 text-sm" style={{ background: 'var(--th-bg-alt, var(--color-sand))' }}>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Date</span><span className="font-medium" style={{ color: 'var(--th-charcoal)' }}>{event.date}</span></div>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Time</span><span className="font-medium" style={{ color: 'var(--th-charcoal)' }}>{event.startTime} – {event.endTime}</span></div>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Venue</span><span className="font-medium" style={{ color: 'var(--th-charcoal)' }}>{event.venue}</span></div>
                    <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Fee</span><span className="font-bold text-ember">₹{event.fee}</span></div>
                </div>
                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--th-text)' }}>Phone Number *</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field mb-1" placeholder="9876543210" required />
                    {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="btn-primary flex-1">Pay ₹{event.fee} & Register</button>
                        <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
