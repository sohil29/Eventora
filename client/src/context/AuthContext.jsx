import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');

        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (error) {
                console.error('Invalid userInfo in localStorage');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('token');
            }
        }

        setLoading(false);
    }, []);

    // LOGIN
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', {
                email,
                password
            });

            setUser(data);

            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            return data;

        } catch (error) {
            console.error('Login error:', error);

            throw (
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Login failed'
            );
        }
    };

    // REGISTER
    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password
            });

            return data;

        } catch (error) {
            console.error('Registration error:', error);

            throw (
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Registration failed'
            );
        }
    };

    // VERIFY OTP
    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', {
                email,
                otp
            });

            setUser(data);

            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            return data;

        } catch (error) {
            console.error('OTP verification error:', error);

            throw (
                error.response?.data?.error ||
                error.response?.data?.message ||
                'OTP verification failed'
            );
        }
    };

    // LOGOUT
    const logout = () => {
        setUser(null);

        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                verifyOTP,
                logout,
                loading
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;