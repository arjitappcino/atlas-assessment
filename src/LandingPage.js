

import React, { useState } from 'react';

function LandingPage(props) {
    const [userName, setUserName] = useState('');
    const [userDesignation, setUserDesignation] = useState('');

    const handleLogin = () => {
        if (userName && userDesignation) {
            props.onLogin(userName, userDesignation);
        }
    };



    return (
        <div>
            <h2>User Details for Pre-Assessment</h2>
            <input
                type="text"
                placeholder="Name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Designation"
                value={userDesignation}
                onChange={e => setUserDesignation(e.target.value)}
            />
            <button onClick={handleLogin}>Start</button>
        </div>
    );
}

export default LandingPage;
