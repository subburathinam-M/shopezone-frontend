import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <Spinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;