import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { config } from '../configs/config';
import { waitFor } from '../utils/helpers';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (email === '' || password === '') {
            alert('Please fill all the fields');
            return;
        }

        try {
            const res = await axios.post(`${config.baseUrl}/users/register`, {
                email,
                password
            });

            if (res.status === 201) {
                setEmail('');
                setPassword('');

                // this will save the token in Cookies with key 'jwt' and value as the token
                // the token will expire in 1 day
                Cookies.set('jwt', res.data.token, { expires: 1 });

                await waitFor(1000);
                navigate('/');
            } else {
                console.log(res.data);
            }
        } catch (err) {
            let errorMessage = err?.response?.data?.error;
            console.log(errorMessage);
            alert(errorMessage);
            console.log(err.response.data);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (email.length === 0 || password.length === 0) {
                return;
            }

            handleRegister();
        }
    }

    return (
        <div className='h-screen flex justify-center items-center bg-slate-200'>
            <div className='flex flex-col gap-10 bg-slate-100 p-5 rounded-lg drop-shadow max-w-1/2 min-w-[400px]'>
                <span className='flex flex-col justify-start items-start gap-2'>
                    <label className='text-2xl rounded-md'>Email</label>
                    <input
                        value={email}
                        type='text'
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full p-3 text-lg rounded-md'
                        placeholder='john@gmail.com'
                        onKeyDown={(e) => handleKeyDown(e)}
                    />
                </span>

                <span className='flex flex-col justify-start items-start gap-2'>
                    <label className='text-2xl rounded-md'>Password</label>
                    <input
                        value={password}
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full p-3 text-lg rounded-md'
                        placeholder='My#Secure#Password123'
                        onKeyDown={(e) => handleKeyDown(e)}
                    />
                </span>

                <div className='w-full flex flex-col justify-center gap-2'>
                    <button onClick={handleRegister} className='bg-blue-500 p-2 text-slate-100 text-2xl rounded-md'>Register</button>
                    <div className='flex justify-center gap-2 mt-4'>
                        <p>Already registered ?</p>
                        <Link to='/login' className='text-blue-500'>Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
