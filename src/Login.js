

import React, { useState } from 'react';
import './Login.css';
import xebiaLogo from './images/xebiaLogo.png';
import atlasLogo from './images/atlasLogo.png';

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    function isValidEmail(email) {
        return email.toLowerCase().endsWith("@xebia.com");
    }

    const handleLogin = async () => {
        setErrorMessage(''); // Clear any previous error messages

        if (!isValidEmail(email)) {
            setErrorMessage('Use xebia id to login');
            return; // Stop the login process if email is invalid
        }
        if (email && password) {
            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password}),
                });

                const data = await response.json();

                if (data.success) {
                    props.onLogin(email,data.isAdmin);
                } else {
                    // Handle login failure
                    setErrorMessage('User does not exist. Contact your administrator.');
                }
            } catch (error) {
                console.error('Login error:', error);
            }

            try {
                const response = await fetch('http://localhost:5000/api/statusActive', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (data.success) {
                    console.log("status now active on database");
                } else {
                    // Handle login failure
                    console.log("status didn't change");
                }
            } catch (error) {
                console.error('Login error:', error);
            }
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
                {errorMessage && <div className="login-error">{errorMessage}</div>}
                <input
                    type="email"
                    placeholder="Enter your Email ID"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={errorMessage ? 'input-error' : ''}
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
