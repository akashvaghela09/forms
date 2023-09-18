import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { config } from '../configs/config';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const verifyJWT = async () => {
    let token = Cookies.get('jwt');
    if (token === undefined) {
      setIsAuthenticated(false);
    } else {
      try {
        const response = await axios.get(`${config.baseUrl}/users/verify`,
          {
            headers: { Authorization: `Bearer ${token}` }
          });

        if (response.data.success === true) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    verifyJWT();
  }, []);

  if (isLoading) {
    return null; // or return a loading indicator
  }

  return isAuthenticated ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
