import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import PreAssessment from './PreAssessment';
import FinalAssessment from './FinalAssessment';
import AdminDashboard from './AdminDashboard';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isPreAssessmentStarted, setIsPreAssessmentStarted] = useState(false);
    const [currentView, setCurrentView] = useState('login');
    const [testTopic, setTestTopic] = useState('');
    const [username, setUsername] = useState('');
    const [admin, setIsAdmin] = useState(false);

    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn, "isPreAssessmentStarted:", isPreAssessmentStarted);
    }, [isLoggedIn, isPreAssessmentStarted]);

    useEffect(() => {

        const session = sessionStorage.getItem('userSession');
        if (session) {
            const sessionObj = JSON.parse(session);
            if (sessionObj.email && Date.now() < sessionObj.expiry) {
                setIsLoggedIn(true);
                setUsername(sessionObj.email);
                setIsAdmin(sessionObj.isAdmin);
                setCurrentView(sessionObj.isAdmin ? 'adminDashboard' : 'dashboard');
            }
        }

        const interval = setInterval(() => {
            const session = sessionStorage.getItem('userSession');
            if (session) {
                const sessionObj = JSON.parse(session);
                if (Date.now() > sessionObj.expiry) {
                    handleLogout();
                }
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    const handleLogin = (email,isAdmin) => {
        setIsLoggedIn(true);
        setUsername(email);
        setIsAdmin(isAdmin);
        setCurrentView(admin ? 'adminDashboard' : 'dashboard');
        const expiry = Date.now() + 5 * (60000);
        sessionStorage.setItem('userSession', JSON.stringify({ email, expiry, isAdmin }));
    };

    const handleStartPreAssessment = (topic) => {
        setTestTopic(topic);
        setCurrentView('preAssessment');
    };

    const handleStartFinalAssessment = (topic) => {
        setTestTopic(topic);
        setCurrentView('finalAssessment');
    };

    const handleLogout = async () => {
        const session = sessionStorage.getItem('userSession');
        if (session) {
            const { email } = JSON.parse(session);
            try {
                const response = await fetch('http://localhost:5000/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }), // Send the userId
                });

                // Check if the logout was successful
                const data = await response.json();
                if (!data.success) {
                    console.error('Failed to log out:', data.message);
                    // Handle failed logout attempt
                }
            } catch (error) {
                console.error('Logout error:', error);
                // Handle error in logout attempt
            }
        }

        setIsLoggedIn(false);
        setUsername('');
        setIsAdmin(false);
        setIsPreAssessmentStarted(false);
        sessionStorage.removeItem('userSession');
        setCurrentView('login');
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'login':
                return <Login onLogin={handleLogin} />;
            case 'dashboard':
                return <Dashboard userName={username} onStartPreAssessment={handleStartPreAssessment} onStartFinalAssessment={handleStartFinalAssessment} onLogout={handleLogout} />;
            case 'preAssessment':
                return <PreAssessment userName={username} testTopic={testTopic} onNavigateToDashboard={() => setCurrentView('dashboard')} />;
            case 'finalAssessment':
                return <FinalAssessment userName={username} testTopic={testTopic} />;
            case 'adminDashboard':
                return <AdminDashboard userName={username} />;
            default:
                return <Login onLogin={handleLogin} />;
        }
    };

    return (
        <div className="App">
            {renderCurrentView()}
        </div>
    );
}

export default App;
