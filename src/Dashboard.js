import React, { useState, useEffect } from 'react';
import catIcon from './images/CAT.png';
import petIcon from './images/PET.png';
import aetIcon from './images/AET.png';
import './Dashboard.css'; // Assuming this is the correct path

function Dashboard(props) {
    // Simplified function for starting the pre-assessment

    const [isPreAssessmentCompleted, setIsPreAssessmentCompleted] = useState(false);

    useEffect(() => {
        // Check if PreAssessment is completed
        const sessionData = sessionStorage.getItem('userSession');
        if (sessionData) {
            const sessionObj = JSON.parse(sessionData);
            setIsPreAssessmentCompleted(sessionObj.isPreAssessmentCompleted);
        }
    }, []);


    const startPreAssessment = (topic) => {
        console.log(`Starting PreAssessment with topic: ${topic}`);
        props.onStartPreAssessment(topic);
    };

    const startFinalAssessment = (topic) => {
        console.log(`Starting Final Assessment with topic: ${topic}`);
        props.onStartFinalAssessment(topic);
    };

    const handleLogout = () => {
        props.onLogout();
    }

    return (
        <>
            <nav className="navbar">
                <ul>
                    <li><a href="#dashboard">Dashboard</a></li>
                    <li><a href="#performance">Performance</a></li>
                    <li><a href="#help">Help</a></li>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </ul>
            </nav>
            <div>
                <h3 style={{ textAlign: 'center', marginTop: '30px' }}>Choose a topic to begin the test  <b>↓</b> </h3>
            </div>
            <div className="test-container">
                <div className="test-card">
                    <img src={catIcon} alt="Cognitive Ability Test Icon" />
                    <h3>Pre-Assessment Test</h3>
                    <p>A non-adaptive test used to find user level for Final Assessment Test</p>
                    <button className="test-button" onClick={() => startPreAssessment('Cognitive Ability Test')}>START TEST</button>
                </div>

                <div className="test-card" style={{ boxShadow: '0 5px 10px rgba(0, 100, 0, 0.5)' }}>
                    <img src={petIcon} alt="Employee Behaviour Test Icon" />
                    <h3>Final Assessment Test</h3>
                    <p>An adaptive test used to find accurate user level based on performance as per score and time taken.</p>
                    <button className="test-button" onClick={() => startFinalAssessment('Cognitive Ability Test')} disabled={!isPreAssessmentCompleted}>START TEST</button>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
