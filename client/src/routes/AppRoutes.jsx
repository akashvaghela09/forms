import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TestPage from './TestPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<PrivateRoute component={TestPage} />} />
        <Route path="/" element={<p>HomePage</p>} />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
