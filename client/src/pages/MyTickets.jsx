import { useEffect, useState } from 'react';
import { getMyRegistrations, UPLOADS_URL } from '../services/api';
import { jsPDF } from 'jspdf';

export default function MyTickets() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { getMyRegistrations().then(r => setRegistrations(r.data.registrations)).catch(console.error).finally(() => setLoading(false)); }, []);
    const formatDate = (d) => d ? new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    const downloadPDF = async (reg) => {
        const doc = new jsPDF(); const pw = doc.internal.pageSize.getWidth();
        doc.setFillColor(232, 114, 92); doc.rect(0, 0, pw, 45, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(26); doc.setFont(undefined, 'bold'); doc.text('EventBuzz', pw / 2, 20, { align: 'center' });
        doc.setFontSize(11); doc.setFont(undefined, 'normal'); doc.text('Event Registration Ticket', pw / 2, 33, { align: 'center' });
        doc.setTextColor(44, 24, 16); doc.setFontSize(20); doc.setFont(undefined, 'bold'); doc.text(reg.eventTitle, pw / 2, 65, { align: 'center' });
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        const s = 82, h = 12;
        [['Registration ID', `#${reg.id}`], ['Date', formatDate(reg.eventDate)], ['Time', `${reg.startTime} – ${reg.endTime}`], ['Venue', reg.venue], ['Fee Paid', `Rs. ${reg.fee}`], ['Status', reg.paymentStatus]].forEach(([l, v], i) => {
            doc.setFont(undefined, 'bold'); doc.setTextColor(44, 24, 16); doc.text(l + ':', 30, s + i * h);
            doc.setFont(undefined, 'normal'); doc.setTextColor(139, 114, 98); doc.text(v, 90, s + i * h);
        });
        if (reg.qrCodePath) {
            try {
                const img = new Image(); img.crossOrigin = 'anonymous'; img.src = `${UPLOADS_URL}${reg.qrCodePath}`;
                await new Promise((r, j) => { img.onload = r; img.onerror = j; }); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
                c.getContext('2d').drawImage(img, 0, 0); doc.addImage(c.toDataURL('image/png'), 'PNG', (pw - 55) / 2, s + 75, 55, 55);
            } catch (e) { console.error(e); }
        }
        doc.setFontSize(9); doc.setTextColor(184, 164, 148); doc.text('Show this QR code at the venue entrance.', pw / 2, 275, { align: 'center' });
        doc.save(`EventBuzz-Ticket-${reg.id}.pdf`);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-ember/20 border-t-ember rounded-full animate-spin"></div></div>;

    return (
        <div className="page-container">
            <div className="mb-10 reveal"><h1 className="section-title">🎫 My Tickets</h1><p className="section-subtitle">Your event registration tickets with QR codes</p></div>
            {registrations.length === 0 ? (
                <div className="glass-card p-14 text-center hover:!transform-none reveal"><span className="text-6xl block mb-4">🎟️</span><p className="text-xl text-text-muted font-medium mb-2">No tickets yet</p><p className="text-sm text-text-muted">Register for events to see your tickets here.</p></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                    {registrations.map((reg, i) => (
                        <div key={reg.id} className="glass-card overflow-hidden hover:!transform-none reveal" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                            <div className="p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #E8725C, #D4604F, #2EC4B6)' }}>
                                <div className="absolute top-2 right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                                <h3 className="text-xl font-extrabold relative">{reg.eventTitle}</h3>
                                <p className="text-sm text-white/70 mt-1.5">{reg.clubName}</p>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <div className="flex-1 space-y-3 text-[0.85rem]">
                                        <div className="flex items-center gap-2.5 text-text-secondary"><span className="text-lg">📅</span><span className="font-medium">{formatDate(reg.eventDate)}</span></div>
                                        <div className="flex items-center gap-2.5 text-text-secondary"><span className="text-lg">🕐</span><span>{reg.startTime} – {reg.endTime}</span></div>
                                        <div className="flex items-center gap-2.5 text-text-secondary"><span className="text-lg">📍</span><span>{reg.venue}</span></div>
                                        <div className="flex items-center gap-2.5 text-text-secondary"><span className="text-lg">💰</span><span className="font-bold">₹{reg.fee}</span></div>
                                        <div className="pt-1"><span className="badge badge-success">✓ {reg.paymentStatus}</span></div>
                                    </div>
                                    {reg.qrCodePath && (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-white border-2 border-border-light rounded-2xl shadow-sm"><img src={`${UPLOADS_URL}${reg.qrCodePath}`} alt="QR" className="w-28 h-28 object-contain" /></div>
                                            <p className="text-[0.7rem] text-text-muted font-medium uppercase tracking-wider">Scan at Venue</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => downloadPDF(reg)} className="btn-outline w-full mt-5 text-sm">📥 Download Ticket PDF</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
