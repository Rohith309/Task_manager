import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem('username');
    
    return isAuthenticated ? children : <Navigate to="/" />;
}

export default ProtectedRoute;