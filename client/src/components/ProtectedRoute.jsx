import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles, adminRoute }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not logged in → redirect to appropriate login page
    if (!user) {
        return <Navigate to={adminRoute ? '/admin-login' : '/login'} replace />;
    }

    // Role check: if roles specified and user role doesn't match
    if (roles && !roles.includes(user.role)) {
        if (adminRoute) {
            // Non-admin trying to access admin route → redirect to admin login
            return <Navigate to="/admin-login" replace />;
        }
        return (
            <div className="page-container text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-500">You don't have permission to view this page.</p>
            </div>
        );
    }

    return children;
}
