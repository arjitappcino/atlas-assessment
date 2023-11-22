import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import PreAssessment from './PreAssessment';
import FinalAssessment from './FinalAssessment';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isPreAssessmentStarted, setIsPreAssessmentStarted] = useState(false);
    const [currentView, setCurrentView] = useState('login');
    const [testTopic, setTestTopic] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn, "isPreAssessmentStarted:", isPreAssessmentStarted);
    }, [isLoggedIn, isPreAssessmentStarted]);

    useEffect(() => {

        const session = sessionStorage.getItem('userSession');
        if (session) {
            const sessionObj = JSON.parse(session);
            if (sessionObj.email && Date.now() < sessionObj.expiry) {
                setIsLoggedIn(true);
                setUsername(sessionObj.email); // Make sure to store the email or username in the session storage during login
                setCurrentView('dashboard');
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


    const handleLogin = (email) => {
        setIsLoggedIn(true);
        setUsername(email);
        const expiry = Date.now() + 5 * (60000);
        setCurrentView('dashboard');
        sessionStorage.setItem('userSession', JSON.stringify({ email, expiry }));
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
        setIsLoggedIn(false);
        setUsername('');
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
