import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Spinner />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;