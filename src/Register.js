

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; 
import xebiaLogo from './images/xebiaLogo.png';
import atlasLogo from './images/atlasLogo.png';

function Register(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleRegister = () => {
        
        
        if (email && password && firstName && lastName) {
            props.onRegister({ email, password, firstName, lastName });
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
                <h1>Create Account</h1>
                <p className='motto'>Join us and start your journey today.</p>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email ID"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="login-actions">
                    <button className="login-button" onClick={handleRegister}>Register</button>
                    <p className="membership-check">
                    <Link to="/" className="register-link">Already have an account?</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
