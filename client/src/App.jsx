import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTickets from './pages/MyTickets';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateEvent from './pages/AdminCreateEvent';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminRevenue from './pages/AdminRevenue';
import AdminVolunteer from './pages/AdminVolunteer';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import Gallery from './pages/Gallery';
import Volunteer from './pages/Volunteer';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Navbar />
                    <main>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/event/:id" element={<EventDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/clubs" element={<Clubs />} />
                            <Route path="/club/:id" element={<ClubDetails />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/volunteer" element={<Volunteer />} />

                            {/* Admin Login (separate entry) */}
                            <Route path="/admin-login" element={<AdminLogin />} />

                            {/* Student Protected Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/dashboard/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />

                            {/* Admin Protected Routes */}
                            <Route path="/admin-dashboard" element={<ProtectedRoute roles={['Admin']} adminRoute><AdminDashboard /></ProtectedRoute>} />
                            <Route path="/admin/create-event" element={<ProtectedRoute roles={['Admin']} adminRoute><AdminCreateEvent /></ProtectedRoute>} />
                            <Route path="/admin/manage-registrations" element={<ProtectedRoute roles={['Admin']} adminRoute><AdminRegistrations /></ProtectedRoute>} />
                            <Route path="/admin/revenue" element={<ProtectedRoute roles={['Admin']} adminRoute><AdminRevenue /></ProtectedRoute>} />
                            <Route path="/admin/volunteer" element={<ProtectedRoute roles={['Admin']} adminRoute><AdminVolunteer /></ProtectedRoute>} />
                        </Routes>
                    </main>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
