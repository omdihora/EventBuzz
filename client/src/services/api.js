import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
export const UPLOADS_URL = baseURL.replace('/api', '') + '/uploads';

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const adminLoginUser = (data) => api.post('/auth/admin-login', data);
export const getMe = () => api.get('/auth/me');

// ── Events ────────────────────────────────────────────────────
export const getEvents = () => api.get('/events');
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data); // JSON — no multipart override
export const updateEvent = (id, data) => api.put(`/events/${id}`, data); // JSON — no multipart override
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// ── Registrations ─────────────────────────────────────────────
export const registerForEvent = (data) => api.post('/registrations', data);
export const getMyRegistrations = () => api.get('/registrations/my');
export const getEventRegistrations = (eventId) => api.get(`/registrations/event/${eventId}`);

// ── Clubs ─────────────────────────────────────────────────────
export const getClubs = () => api.get('/clubs');
export const getClub = (id) => api.get(`/clubs/${id}`);
export const createClub = (data) => api.post('/clubs', data);
export const deleteClub = (id) => api.delete(`/clubs/${id}`);
export const submitClubApplication = (data) => api.post('/club-applications', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getClubApplications = (clubId) => api.get(`/club-applications/club/${clubId}`);
export const getMyApplications = () => api.get('/club-applications/my');
export const updateApplication = (id, data) => api.put(`/club-applications/${id}`, data);

// ── Admin ─────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminRegistrations = (params) => api.get('/admin/registrations', { params });
export const toggleAttendance = (id) => api.put(`/admin/registrations/${id}/attendance`);
export const exportRegistrationsCSV = (params) => api.get('/admin/registrations/export', { params, responseType: 'blob' });
export const getAdminRevenue = () => api.get('/admin/revenue');

// ── Volunteer ─────────────────────────────────────────────────
export const getVolunteerRoles = (eventId) => api.get('/volunteer/roles', { params: { eventId } });
export const createVolunteerRole = (data) => api.post('/volunteer/roles', data);
export const deleteVolunteerRole = (id) => api.delete(`/volunteer/roles/${id}`);

export const applyForVolunteerRole = (data) => api.post('/volunteer/apply', data);
export const getMyVolunteerApplications = () => api.get('/volunteer/applications/me');
export const getAllVolunteerApplications = () => api.get('/volunteer/applications');
export const updateVolunteerApplicationStatus = (id, status) => api.put(`/volunteer/applications/${id}/status`, { status });

export const markVolunteerCompleted = (data) => api.post('/volunteer/completed', data);
export const getMyVolunteerPayments = () => api.get('/volunteer/payments/me');
export const getAllVolunteerPayments = () => api.get('/volunteer/payments');
export const updateVolunteerPaymentStatus = (id, status) => api.put(`/volunteer/payments/${id}/status`, { status });

// ── Payments & Ticketing ──────────────────────────────────────
export const createPaymentOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);

export default api;
