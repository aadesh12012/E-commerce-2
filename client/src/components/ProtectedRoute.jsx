import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
    if (roleRequired === "admin") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.role === "admin") {
                    return children;
                }
            } catch (e) {
                console.error("Error parsing user from localStorage");
            }
        }
        // Redirect to user login if not an admin
        return <Navigate to="/" replace />;
    }
    
    if (roleRequired === "seller") {
        const sellerStr = localStorage.getItem("seller");
        if (sellerStr) {
            return children;
        }
        // Redirect to seller login if not logged in as a seller
        return <Navigate to="/sellerlogin" replace />;
    }

    // Default fallback
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;

