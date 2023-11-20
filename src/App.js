import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import PreAssessment from './PreAssessment';
import FinalAssessment from './FinalAssessment';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isPreAssessmentStarted, setIsPreAssessmentStarted] = useState(false);
    const [currentView, setCurrentView] = useState('login');
    const [testTopic, setTestTopic] = useState('');
    const [username, setUsername] = useState('');
    const [shouldNavigateToPreAssessment, setShouldNavigateToPreAssessment] = useState(false);

    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn, "isPreAssessmentStarted:", isPreAssessmentStarted);
    }, [isLoggedIn, isPreAssessmentStarted]);

    useEffect(() => {

        const session = sessionStorage.getItem('userSession');
        if (session) {
            const sessionObj = JSON.parse(session);
            if (Date.now() < sessionObj.expiry) {
                setIsLoggedIn(true);
                setUsername(sessionObj.username);
            } else {
                sessionStorage.removeItem('userSession');
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


    const handleLogin = (username) => {
        setIsLoggedIn(true);
        setUsername(username);
        const expiry = Date.now() + 5 * (60000);
        setCurrentView('dashboard');
        sessionStorage.setItem('userSession', JSON.stringify({ username, expiry }));
    };

    const handleStartPreAssessment = (topic) => {
        setTestTopic(topic);
        setCurrentView('preAssessment'); // Change view to PreAssessment
    };

    const handleStartFinalAssessment = (topic) => {
        setTestTopic(topic);
        setCurrentView('finalAssessment'); // Change view to PreAssessment
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setIsPreAssessmentStarted(false);

        sessionStorage.removeItem('userSession');
    };

    // return (
    //     <Router>
    //         <div className="App">
    //             <Routes>
    //                 <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
    //                 <Route path="/register" element={<Register />} />
    //                 <Route path="/dashboard" element={isLoggedIn ? <Dashboard userName={username} onStartPreAssessment={(topic) => {
    //                     setTestTopic(topic);
    //                     setIsPreAssessmentStarted(true);
    //                     console.log("Appjs Starting PreAssessment with topic:", testTopic);
    //                     console.log("Appjs PreAssessment started?:", isPreAssessmentStarted);
    //                 }} onLogout={handleLogout} /> : <Navigate to="/" />} />
    //                 <Route path="/pre-assessment" element={isPreAssessmentStarted ? <PreAssessment userName={username} testTopic={testTopic} /> : <Navigate to="/dashboard" />} />
    //                 { }
    //             </Routes>
    //         </div>
    //     </Router>
    // );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'login':
                return <Login onLogin={handleLogin}/>;
            case 'register':
                return <Register />;
            case 'dashboard':
                return <Dashboard userName={username} onStartPreAssessment={handleStartPreAssessment} onStartFinalAssessment={handleStartFinalAssessment} onLogout={handleLogout} />;
            case 'preAssessment':
                return <PreAssessment userName={username} testTopic={testTopic} />;
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
