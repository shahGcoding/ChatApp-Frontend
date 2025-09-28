import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { logoutUser } from '../config/config.js';
import { Button } from './ui/button.js';

function LogoutBtn() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logoutUser().then(() => {
                dispatch(logout());
                navigate('/login');
            }
        );
    }
    };

  return (
    <Button className='inline-block px-6 bg-orange-600 text-gray-100 py-2 duration-200 transition-transform hover:scale-110 hover:cursor-pointer rounded-full' onClick={handleLogout}>Logout</Button>
  )
}

export default LogoutBtn