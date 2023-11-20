// src/Login.js

import React, { useState } from 'react';
import './Login.css';
import logo from './images/logo2.jpg';

function Login(props) {
    const [userName, setUsername] = useState('');
    const [userDesignation, setDesignation] = useState('');

    const handleLogin = () => {
        if (userName && userDesignation) {
            props.onLogin(userName,userDesignation);
        }
    };

    return (
        <div className="login-background">
            <div className="login-card">
                <img src={logo} alt="Company Logo" className="login-logo" />
                <input
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={userDesignation}
                    onChange={e => setDesignation(e.target.value)}
                />
                <button className="login-button" onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default Login;
