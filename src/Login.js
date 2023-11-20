

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import xebiaLogo from './images/xebiaLogo.png';
import atlasLogo from './images/atlasLogo.png';

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (email && password) {
            props.onLogin(email, password);
        }
    };

    return (
        <div className="login-container">
            <div className="welcome-section">
                <img src={xebiaLogo} alt="Company Logo" className="login-logo" />
                <footer>Copyright © Team Rocket | Xebia Techathon</footer>
            </div>
            <div className="login-section">
                <img src={atlasLogo} alt="Company Logo" className="login-atlas-logo" />
                <h1>Welcome to ATLAS</h1>
                <p className='motto'>Tailoring your assessment experience to highlight your strengths and discover your potential.</p>
                <h2>Get Started</h2>
                <input
                    type="email"
                    placeholder="Enter your Email ID"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="login-actions">
                    <button className="login-button" onClick={handleLogin}>Sign In</button>
                </div>
            </div>
        </div>
    );
}

export default Login;
