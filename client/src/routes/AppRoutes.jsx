import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import PrivateRoute from './PrivateRoute';
import Dashboard from './Dashboard';

const AppRoutes = () => {
  return (
    <div className='w-full'>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute component={Dashboard} />} />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
