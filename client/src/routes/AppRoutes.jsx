import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import PrivateRoute from './PrivateRoute';
import Dashboard from './Dashboard';
import CreatePage from './CreatePage';
import SubmissionPage from './SubmissionPage';

const AppRoutes = () => {
  return (
    <div className='w-full'>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private Routes */}
        <Route path="/" element={<PrivateRoute component={Dashboard} />} />
        <Route path="/create" element={<PrivateRoute component={CreatePage} />} />
        <Route path="/:id" element={<PrivateRoute component={SubmissionPage} />} />

        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
