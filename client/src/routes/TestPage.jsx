import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const TestPage = () => {
  const navigate = useNavigate();
  const [jwt, setJWT] = useState('');

  const loadJWT = async () => {
    const jwt = Cookies.get('jwt');
    if (jwt) {
      setJWT(jwt);
    }
  }

  useEffect(() => {
    loadJWT();
  }, []);

  return (
    <div>
      <h1>Test Page</h1>
      <h1>{jwt}</h1>

      <button onClick={() => {
        Cookies.remove('jwt');
        navigate('/login');
      }
      }>Logout</button>
    </div>
  );
};

export default TestPage;
