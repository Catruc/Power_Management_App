import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const LogoutRedirect = ({ handleLogout }) => {
    useEffect(() => {
        // Logout the user and then redirect
        handleLogout();
    }, [handleLogout]);

    return <Navigate to="/login" />;
};

export default LogoutRedirect;
