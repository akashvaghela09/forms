import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    return (
        <div className='h-screen flex justify-center items-center bg-slate-200'>
            <div className='flex flex-col gap-10 bg-slate-100 p-5 rounded-lg drop-shadow max-w-1/2 min-w-[400px]'>
                <span className='flex flex-col justify-start items-start gap-2'>
                    <label className='text-2xl rounded-md'>Email</label>
                    <input className='w-full p-3 text-lg rounded-md' placeholder='john@gmail.com' />
                </span>

                <span className='flex flex-col justify-start items-start gap-2'>
                    <label className='text-2xl rounded-md'>Password</label>
                    <input className='w-full p-3 text-lg rounded-md' placeholder='john@gmail.com' />
                </span>

                <div className='w-full flex flex-col justify-center gap-2'>
                    <button className='bg-blue-500 p-2 text-slate-100 text-2xl rounded-md'>Login</button>
                    <div className='flex justify-center gap-2 mt-4'>
                        <p>Don't have an account ?</p>
                        <Link to='/register' className='text-blue-500'>Register</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
