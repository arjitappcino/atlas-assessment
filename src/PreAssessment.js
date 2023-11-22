import React, { useState, useEffect } from 'react';

let questions = null;

const fetchQuestionsFromAPI = async (apiEndpoint) => {
    try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        console.log('Here is the data:', data);
        questions = data;
        console.log(`Questions List: ${JSON.stringify(questions, null, 2)}`);
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

const pointRules = {
    'Easy': { correct: 1, wrong: -0.75 },
    'Medium': { correct: 2, wrong: -0.5 },
    'Hard': { correct: 3, wrong: -0.25 },
};

const getColorForLevel = (level) => {
    switch (level) {
        case 'Beginner': return 'red';
        case 'Intermediate': return 'purple';
        case 'Proficient': return 'blue';
        case 'Expert': return 'green';
        default: return 'grey';
    }
};

const determineLevel = (score) => {
    const maxScore = 17;
    const minScore = -4.5;
    const range = maxScore - minScore;

    if (score <= minScore + 0.25 * range) return 'Beginner';
    if (score <= minScore + 0.5 * range) return 'Intermediate';
    if (score <= minScore + 0.75 * range) return 'Proficient';
    return 'Expert';
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const App = (props) => {
    console.log("PreAssessment rendered with props:", props);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [correctByDifficulty, setCorrectByDifficulty] = useState({ 'Easy': 0, 'Medium': 0, 'Hard': 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(5 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [skippedQuestions, setSkippedQuestions] = useState({});
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [startTimestamp, setStartTimestamp] = useState(null);
    const [timeTakenList, setTimeTakenList] = useState([]);
    const [showReadinessPopup, setShowReadinessPopup] = useState(true);
    const [questionsList, setQuestionsList] = useState([]);
    const [countdown, setCountdown] = useState(3);
    const [showCountdown, setShowCountdown] = useState(false);
    const [displayedQuestionsIndices, setDisplayedQuestionsIndices] = useState([]);
    let [warnings, setWarnings] = useState(0);
    const [userData, setUserData] = useState(null);

    useEffect(() => {

        async function handleWarning() {
            warnings += 1;
            if (warnings === 1) {
                alert("Warning: If you try to switch tabs or leave the page again, the test will be submitted automatically.");
            } else if (warnings > 1 && isFinished != true) {
                const user = {
                    assessmentType: 'pre',
                    userName: props.userName,
                    userDesignation: props.userDesignation,
                    userLevel: determineLevel(score),
                    topic: props.testTopic,
                    easyCorrectQuestions: correctByDifficulty['Easy'],
                    mediumCorrectQuestions: correctByDifficulty['Medium'],
                    hardCorrectQuestions: correctByDifficulty['Hard'],
                    totalCorrectQuestions: correctByDifficulty['Easy'] + correctByDifficulty['Medium'] + correctByDifficulty['Hard'],
                    totalTimeTaken: 5 * 60 - timeRemaining,
                    totalScore: score
                };
                setUserData(user);
                finishTest(userData);
                setIsFinished(true);
                setTimerActive(false);
                alert("You have attempted to leave the test page again. The test is now being submitted.");
            }
            return warnings;
        }

        function handleVisibilityChange() {
            if (document.visibilityState === 'hidden') {
                handleWarning();
            }
        }

        // function handleWindowBlur() {
        //     handleWarning();
        // }

        function handleContextMenu(e) {
            e.preventDefault();
        }

        // window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            // window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);


    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await fetchQuestionsFromAPI(`http://localhost:5000/questionBank/topic/${props.testTopic}`);
                console.log(`here is the data: ${data}`);
                const shuffledQuestions = shuffleArray(questions || []);
                setQuestionsList(shuffledQuestions);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        let timerId;
        if (showCountdown && countdown > 0) {
            timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setShowCountdown(false);
            setTimerActive(true);
        }
        return () => clearTimeout(timerId);
    }, [countdown, showCountdown]);

    useEffect(() => {
        setShowReadinessPopup(true);
        console.log(props.testTopic);
        console.log(`before clicked ready: ${questionsList}`);
    }, []);

    const handleReady = () => {
        setShowReadinessPopup(false);
        setShowCountdown(true);
        setCountdown(3);
        console.log(`after clicked ready: ${questionsList}`);
        console.log(`options: ${questionsList[currentQuestion].options[1]}`);
        console.log(`current question index: ${currentQuestion}`);
    };

    useEffect(() => {
        if (timerActive && timeRemaining > 0 && !isFinished) {
            const timerId = setTimeout(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);

            return () => clearTimeout(timerId);
        } else if (timeRemaining <= 0 && !isFinished) {
            setIsFinished(true);
            setTimerActive(false);
        }
    }, [timerActive, timeRemaining, isFinished]);

    useEffect(() => {
        setStartTimestamp(new Date().getTime());
    }, [currentQuestion]);

    if (showCountdown) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000, // Make sure it's above everything else
            }}>
                <div style={{
                    fontSize: '5rem',
                    color: 'white'
                }}>
                    {countdown > 1 ? countdown : 'Good Luck!'}
                </div>
            </div>
        );
    }

    const finishTest = async (userData) => {

        await saveUserDataToDB(userData).then(result => {
            if (result && result.success) {
                console.log('User data saved successfully');
            } else {
                console.error('Failed to save user data');
            }
        });

        const sessionData = sessionStorage.getItem('userSession');
        if (sessionData) {
            const sessionObj = JSON.parse(sessionData);
            sessionObj.isPreAssessmentCompleted = true;
            sessionStorage.setItem('userSession', JSON.stringify(sessionObj));
        }

        // Redirect to Dashboard
        props.history.push('/dashboard');
    }

    const handleOptionClick = (selectedOption) => {
        updateTimeTaken();
        const currentDifficulty = questionsList[currentQuestion].difficulty;

        if (selectedOption === questionsList[currentQuestion].answer) {
            setScore(prevScore => prevScore + pointRules[currentDifficulty].correct);
            setCorrectByDifficulty({
                ...correctByDifficulty,
                [currentDifficulty]: correctByDifficulty[currentDifficulty] + 1
            });
        } else {
            setScore(prevScore => prevScore + pointRules[currentDifficulty].wrong);
        }

        setAnsweredQuestions({
            ...answeredQuestions,
            [currentQuestion]: selectedOption
        });

        if (currentQuestion != questionsList.length - 1) {
            setCurrentQuestion(currentQuestion + 1);

        }

    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const navigateQuestion = (index) => {
        setCurrentQuestion(index);
    };

    const prevQuestion = () => {
        updateTimeTaken();
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
        setDisplayedQuestionsIndices(prevIndices => [...prevIndices, currentQuestion - 1]);
    };

    const handleSkip = () => {
        updateTimeTaken();
        setSkippedQuestions(prev => ({ ...prev, [currentQuestion]: true }));
        if (currentQuestion < questions.length - 1) {
            nextQuestion();
        }
    };


    const nextQuestion = () => {
        updateTimeTaken();

        if (currentQuestion < questionsList.length) {

            setCurrentQuestion(currentQuestion + 1);
            setDisplayedQuestionsIndices(prevIndices => [...prevIndices, currentQuestion + 1]);
        } else {
            alert('All questions have been displayed');
        }
    };

    const handleSubmitTest = async () => {
        const unmarkedQuestions = [];
        questionsList.forEach((_, index) => {
            if (!answeredQuestions.hasOwnProperty(index)) {
                unmarkedQuestions.push(index);
            }
        });

        if (unmarkedQuestions.length > 0) {
            alert(`You missed answering the following questions: ${unmarkedQuestions.map(num => num + 1).join(', ')}`);
        } else {
            const userData = {
                assessmentType: 'pre',
                userName: props.userName,
                userLevel: determineLevel(score),
                topic: props.testTopic,
                easyCorrectQuestions: correctByDifficulty['Easy'],
                mediumCorrectQuestions: correctByDifficulty['Medium'],
                hardCorrectQuestions: correctByDifficulty['Hard'],
                totalCorrectQuestions: correctByDifficulty['Easy'] + correctByDifficulty['Medium'] + correctByDifficulty['Hard'],
                totalTimeTaken: 5 * 60 - timeRemaining,
                totalScore: score
            };

            await saveUserDataToDB(userData).then(result => {
                if (result && result.success) {
                    console.log('User data saved successfully');
                } else {
                    console.error('Failed to save user data');
                }
            });
            setIsFinished(true);
            setTimerActive(false);
        }
    };

    const updateTimeTaken = () => {
        const currentTimestamp = new Date().getTime();
        const timeTaken = (currentTimestamp - startTimestamp) / 1000; // in seconds

        const updatedTimeList = [...timeTakenList];
        updatedTimeList[currentQuestion] = timeTaken;
        setTimeTakenList(updatedTimeList);
    };

    const saveUserDataToDB = async (userData) => {
        try {
            const response = await fetch(`http://localhost:5000/savePerformance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            console.log("Data saved with ID:", data.id);

            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };


    if (isFinished) {
        const userLevel = determineLevel(score);
        const timeTaken = 5 * 60 - timeRemaining;
        const userDisplayScore = correctByDifficulty['Easy'] + correctByDifficulty['Medium'] + correctByDifficulty['Hard'];

        return (
            <div>
                <h2>Results: {props.userName}</h2>
                <p>Topic: {props.testTopic}</p>
                <p>Total Score: {userDisplayScore}/10</p>
                <div style={{ color: getColorForLevel(userLevel) }}>
                    Your Level: {userLevel}
                </div>
                <div>
                    Time Taken: {formatTime(timeTaken)}
                </div>
                {/* <button style={{ marginTop: '50px' }} onClick={() => setIsReviewMode(true)}>Check Answers</button> */}
                <button onClick={() => props.onNavigateToDashboard()} className="go-to-dashboard-button">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (showReadinessPopup) {
        return (
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                padding: '20px',
                width: '370px',
                borderRadius: '6px',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }} className="readiness-popup">
                <h2>Are you ready to start the test?</h2>
                <button onClick={handleReady}>Ready</button>
            </div>

        );
    }

    if (!questionsList[currentQuestion]?.options) {
        return <div style={{ padding: '15px', backgroundColor: 'white', marginBottom: '20px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
            {questionsList[currentQuestion].options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 15px',
                        margin: '10px 0',
                        textAlign: 'left',
                        backgroundColor: answeredQuestions[currentQuestion] === index ? '#e0e0e0' : 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px'
                    }}>
                    {option}
                </button>
            ))}
        </div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div style={{ flex: 2, padding: '10px' }}>
                <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
                    <div style={{ width: '90%', margin: '10px 10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '30px' }}>

                        {/* Question Box */}
                        <div style={{ paddingBottom: '50px', padding: '15px', backgroundColor: 'white', marginBottom: '30px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                            <strong>Question {currentQuestion + 1}</strong>
                            <p style={{ paddingTop: '20px', paddingBottom: '20px' }}>{questionsList[currentQuestion].question_text}</p>
                        </div>

                        {/* Options Box */}
                        <div style={{ padding: '15px', backgroundColor: 'white', marginBottom: '20px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                            {Array.isArray(questionsList[currentQuestion]?.options) ? (questionsList[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px 15px',
                                        margin: '10px 0',
                                        textAlign: 'left',
                                        backgroundColor: answeredQuestions[currentQuestion] === index ? '#e0e0e0' : 'white',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '4px'
                                    }}>
                                    {option}
                                </button>
                            ))) : (
                                <p>Options are not available.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: 'white',
                    padding: '10px',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <button onClick={prevQuestion} disabled={currentQuestion === 0}>Prev</button>
                    <button onClick={handleSkip} style={{ marginLeft: '10px' }} disabled={answeredQuestions.hasOwnProperty(currentQuestion)}>Skip</button>
                    {currentQuestion === questionsList.length - 1
                        ? <button onClick={handleSubmitTest} style={{ marginLeft: '10px' }}>Submit Test</button>
                        : <button onClick={nextQuestion} style={{ marginLeft: '10px' }} disabled={currentQuestion === questionsList.length - 1}>Next</button>}
                </div>
            </div>

            <div style={{ flex: 1, padding: '20px', borderLeft: '2px solid #ccc' }}>
                <h3>Question {currentQuestion + 1}/{questionsList.length}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginTop: '20px' }}>
                    {questionsList.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => navigateQuestion(index)}
                            style={{
                                backgroundColor: answeredQuestions.hasOwnProperty(index)
                                    ? 'skyblue'
                                    : skippedQuestions.hasOwnProperty(index)
                                        ? 'palegoldenrod'
                                        : '2px solid skyblue',
                                border: answeredQuestions.hasOwnProperty(index)
                                    ? 'none'
                                    : '2px solid skyblue',

                                cursor: 'pointer',
                            }}>
                            {index + 1}
                        </button>

                    ))}
                </div>
                <div>
                    Time Remaining: {formatTime(timeRemaining)}
                </div>
            </div>
        </div>
    );
};

export default App;