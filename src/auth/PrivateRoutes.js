// PrivateRoute.js
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ element, isAuthenticated, ...rest }) => {

    return (Cookies.get('isAuthenticated') ? element : <Navigate to={process.env.PUBLIC_URL + '/login'} replace />)
};

export default PrivateRoute;