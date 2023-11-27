import React, { useState, useEffect } from 'react';

const pointRules = {
    'Easy': { correct: 100, wrong: -75 },
    'Medium': { correct: 200, wrong: -50 },
    'Hard': { correct: 300, wrong: -25 },
};

const determineLevel = (score) => {
    const maxScore = 1500;
    const minScore = -375;
    const range = maxScore - minScore;

    if (score <= minScore + 0.25 * range) return 'Novice';
    if (score <= minScore + 0.5 * range) return 'Learner';
    if (score <= minScore + 0.75 * range) return 'Competent';
    return 'Specialist';
};

const determineLevelSJT = (score) => {
    const maxScore = 1500;
    const minScore = -375;
    const range = maxScore - minScore;

    if (score <= minScore + 0.25 * range) return 'Observer';
    if (score <= minScore + 0.5 * range) return 'Responder';
    if (score <= minScore + 0.75 * range) return 'Navigator';
    return 'Strategist';
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

const TestDetails = (props) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            padding: '20px',
            width: 'auto',
            borderRadius: '6px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <h1>ATLAS: Final Assessment</h1>
            <p>Organised By: Xebia</p>
            <p>Closes On: Wed,Dec 31, 2025, 11:59 PM IST</p>
            <p>Duration: 10 minute(s)</p>
            <p>Description: This is a DEMO test hosted by Team Rocket to get candidate performance level.</p>
            {/* <p>Sections: 1</p> */}
            <p>10 MCQ (10 minute(s))</p>
            <p>Instructions:</p>
            <ul>
                <li>Make sure you have a proper internet connection.</li>
                <li>Your webcam is working fine.</li>
                <li>Do not use your mobile phone or other electronic devices.</li>
            </ul>
            <button onClick={props.onStartTest}>START TEST</button>
        </div>
    );
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};



const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const App = (props) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [correctByDifficulty, setCorrectByDifficulty] = useState({ 'Easy': 0, 'Medium': 0, 'Hard': 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(5 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [startTimestamp, setStartTimestamp] = useState(null);
    const [timeTakenList, setTimeTakenList] = useState([]);
    const [showReadinessPopup, setShowReadinessPopup] = useState(true);
    const [questionsList, setQuestionsList] = useState([]);
    const [countdown, setCountdown] = useState(3);
    const [showCountdown, setShowCountdown] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [userData, setUserData] = useState(null);
    const [efficiencyScores, setEfficiencyScores] = useState([]);
    const [combinedScore, setCombinedScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(false);
    const [currentDifficulty, setCurrentDifficulty] = useState('Medium'); // Start with medium difficulty
    const [questionsAttempted, setQuestionsAttempted] = useState(0);
    const [displayedQuestionIds, setDisplayedQuestionIds] = useState([]);
    const [currentTopic, setCurrentTopic] = useState('Cognitive Ability Test');
    const [questionsFromCurrentTopic, setQuestionsFromCurrentTopic] = useState(0);
    const [topicChanged, setTopicChanged] = useState(false);
    const [userCharacteristics, setUserCharacteristics] = useState([]);
    const [cognitiveScore, setCognitiveScore] = useState(0);
    const [situationalScore, setSituationalScore] = useState(0);
    const [personalityResponses, setPersonalityResponses] = useState({});

    useEffect(() => {
        const fetchQuestionsForCurrentTopic = async () => {
            console.log(`Fetching questions for topic: ${currentTopic}`);
            const questions = await fetchQuestionsByTopic(currentTopic, currentTopic !== 'Personality Test');
            setQuestionsList(questions.slice(0, 5)); // Take only 5 questions
            setCurrentQuestion(0);
            setQuestionsFromCurrentTopic(0); // Reset the count for the current topic
            console.log(`Questions set for topic: ${currentTopic}`);
        };
    
        if (topicChanged || (questionsAttempted === 0 && showReadinessPopup === false)) {
            fetchQuestionsForCurrentTopic();
            setQuestionsFromCurrentTopic(0); // Reset question count for new topic
            setTopicChanged(false); // Reset the flag after changing the topic
        }
    }, [currentTopic, topicChanged, questionsAttempted, showReadinessPopup]);
    
    useEffect(() => {
        const fetchAndSetQuestions = async () => {
            // Fetch new questions based on current difficulty or topic
            const newQuestions = await fetchQuestionsByTopic(currentTopic, currentTopic !== 'Personality Test');
    
            // Filter out already displayed questions
            const filteredQuestions = newQuestions.filter(question => 
                !displayedQuestionIds.includes(question.id)
            );
    
            // Update state with new filtered questions
            setQuestionsList(filteredQuestions.slice(0, 5));
            setCurrentQuestion(0);
        };
    
        fetchAndSetQuestions();
    }, [currentTopic, currentDifficulty, displayedQuestionIds]);
    

    useEffect(() => {
        if (questionsFromCurrentTopic >= 5 && questionsAttempted < 15 && !topicChanged) {
            let nextTopic;
            switch (currentTopic) {
                case 'Cognitive Ability Test':
                    nextTopic = 'Situational Judgment Test';
                    break;
                case 'Situational Judgment Test':
                    nextTopic = 'Personality Test';
                    break;
                case 'Personality Test':
                    nextTopic = 'Cognitive Ability Test';
                    break;
                default:
                    nextTopic = 'Cognitive Ability Test'; // Fallback
            }

            console.log(`Switching to next topic: ${nextTopic}`);
            setCurrentTopic(nextTopic);
            setTopicChanged(true); // Indicate that topic is being changed
        }
    }, [currentTopic, questionsFromCurrentTopic, questionsAttempted, topicChanged]);


    useEffect(() => {

        async function handleWarning() {
            warnings += 1;
            if (warnings === 1) {
                alert("Warning: If you try to switch tabs or leave the page again, the test will be submitted automatically.");
            } else if (warnings > 1 && isFinished != true) {
                const user = {
                    userName: props.userName,
                    cognitiveAbilityScore: cognitiveScore,
                    situationalJudgementScore: situationalScore,
                    personalityScore: JSON.stringify(userCharacteristics),
                    totalTimeTaken: formatTime(5 * 60 - timeRemaining),
                    assessmentType: 'final'
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

    const fetchQuestionsByTopic = async (topic, isAdaptive = true) => {
        let apiEndpoint = `http://localhost:5000/revisedQuestionBank/topic/${encodeURIComponent(topic)}`;
        if (isAdaptive) {
            apiEndpoint += `/difficulty/${currentDifficulty}`;
        }

        console.log(`Fetching questions for topic: ${topic}, Adaptive: ${isAdaptive}`);

        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`No questions found for topic: ${topic} and difficulty: ${currentDifficulty}`);
                    return []; // Return an empty array for missing endpoint
                }
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Questions fetched: " + JSON.stringify(data, null, 2));
            return data || [];
        } catch (error) {
            console.error('Error fetching questions for', topic, ':', error);
            return [];
        }
    };

    const handleReady = () => {
        setShowReadinessPopup(false);
        setShowCountdown(true);
        setCountdown(3);
        console.log(`after clicked ready: ${questionsList}`);
        // console.log(`options: ${questionsList[currentQuestion].options[1]}`);
        console.log(`current question index: ${currentQuestion}`);
    };

    const handleOptionClick = (selectedOption) => {
        setSelectedOption(selectedOption);
    };


    const handleNextButtonClick = () => {
        updateTimeTaken();
        console.log('Current question index before Next:', currentQuestion);
        console.log('Selected option for Next:', selectedOption);
        if (selectedOption === null) {
            // Case 1: No option selected
            setModalMessage('You cannot continue without choosing an answer.');
            setIsModalOpen(true);
            setConfirmAction(false); // Indicate that no confirmation action is needed
        } else {
            // Case 2: Option selected, ask for confirmation
            setModalMessage('Please confirm your answer to continue to the next question.');
            setIsModalOpen(true);
            setConfirmAction(true); // Indicate that a confirmation action is needed
        }
    };

    const handleSubmitTest = async () => {
        // Since answering each question is mandatory, we can directly process the final submission
        if (selectedOption === null) {
            if (selectedOption === null) {
                // Case 1: No option selected
                setModalMessage('You cannot continue without choosing an answer.');
                setIsModalOpen(true);
                setConfirmAction(false); // Indicate that no confirmation action is needed
            } else {
                // Case 2: Option selected, ask for confirmation
                setModalMessage('Please confirm your answer to continue to the next question.');
                setIsModalOpen(true);
                setConfirmAction(true); // Indicate that a confirmation action is needed
            }
        } else {
            const userData = {
                userName: props.userName,
                cognitiveAbilityScore: cognitiveScore,
                situationalJudgementScore: situationalScore,
                personalityScore: JSON.stringify(userCharacteristics),
                totalTimeTaken: formatTime(5 * 60 - timeRemaining),
                assessmentType: 'final'
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


    const handleNoFaceDetected = () => {
        alert("No face detected for 10 seconds. The test will now close.");
        setIsFinished(true);
        saveUserDataToDB(userData);
    };

    const confirmSelection = () => {
        if (confirmAction) {
            const currentQuestionData = questionsList[currentQuestion];
            const correctAnswerIndex = currentQuestionData.answer;
            const correctAnswerValue = currentQuestionData.options[correctAnswerIndex];
            let newDifficulty = currentDifficulty; // Keep track of the new difficulty level
    
            if (selectedOption === correctAnswerValue) {
                // Correct answer logic
                const updateScore = pointRules[currentDifficulty].correct;
                setScore(prevScore => prevScore + updateScore);
    
                // Update cognitive and situational scores
                if (currentTopic === 'Cognitive Ability Test') {
                    setCognitiveScore(prevScore => prevScore + updateScore);
                } else if (currentTopic === 'Situational Judgment Test') {
                    setSituationalScore(prevScore => prevScore + updateScore);
                }
    
                // Determine new difficulty
                newDifficulty = currentDifficulty === 'Easy' ? 'Medium'
                    : currentDifficulty === 'Medium' ? 'Hard' : 'Hard';
            } else {
                // Incorrect answer logic
                const updateScore = pointRules[currentDifficulty].wrong;
                setScore(prevScore => prevScore + updateScore);
    
                // Update cognitive and situational scores
                if (currentTopic === 'Cognitive Ability Test') {
                    setCognitiveScore(prevScore => prevScore + updateScore);
                } else if (currentTopic === 'Situational Judgment Test') {
                    setSituationalScore(prevScore => prevScore + updateScore);
                }
    
                // Determine new difficulty
                newDifficulty = currentDifficulty === 'Hard' ? 'Medium'
                    : currentDifficulty === 'Medium' ? 'Easy' : 'Easy';
            }
    
            // Handling Personality Test answers
            if (currentTopic === 'Personality Test') {
                const selectedOptionIndex = currentQuestionData.options.indexOf(selectedOption);
                const characteristic = currentQuestionData.answerPT[selectedOptionIndex];
                setUserCharacteristics(prevCharacteristics => [...prevCharacteristics, characteristic]);
                console.log(`Added characteristic: ${characteristic}`);
            }
    
            // Update displayedQuestionIds, questionsFromCurrentTopic, and difficulty
            const newDisplayedIds = [...displayedQuestionIds, currentQuestionData.id];
            setDisplayedQuestionIds(newDisplayedIds);
            setQuestionsFromCurrentTopic(questionsFromCurrentTopic + 1);
            setCurrentDifficulty(newDifficulty);
    
            // Reset the selected option
            setSelectedOption(null);

            setQuestionsAttempted(prev => prev + 1);
    
            // Fetch new questions based on the updated difficulty
            if (currentTopic !== 'Personality Test') {
                setCurrentDifficulty(newDifficulty);    
                fetchQuestionsByTopic(currentTopic, true).then(newQuestions => {
                    const filteredQuestions = newQuestions.filter(question => 
                        !displayedQuestionIds.includes(question.id)
                    );
                    setQuestionsList(filteredQuestions.slice(0, 5));
                    setCurrentQuestion(0);
                });
            } else {
                // For personality test, just move to the next question
                if (currentQuestion < questionsList.length - 1) {
                    setCurrentQuestion(prev => prev + 1);
                } else {
                    // Handle end of test or transition to another section
                }
            }
    
            setIsModalOpen(false);
        }
    };
    

    const cancelSelection = () => {
        // Logic to handle cancellation goes here
        setIsModalOpen(false);
    };

    const finishTest = async (userData) => {
        await saveUserDataToDB(userData).then(result => {
            if (result && result.success) {
                console.log('User data saved successfully');
            } else {
                console.error('Failed to save user data');
            }
        });
    }

    const saveUserDataToDB = async (userData) => {
        try {
            const response = await fetch(`http://localhost:5000/saveFinalPerformance`, {
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




    const updateTimeTaken = () => {
        const currentTimestamp = new Date().getTime();
        const timeTaken = (currentTimestamp - startTimestamp) / 1000; // in seconds

        const updatedTimeList = [...timeTakenList];
        updatedTimeList[currentQuestion] = timeTaken;
        setTimeTakenList(updatedTimeList);
    };


    const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
        if (!isOpen) return null;

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
                    <p>{message}</p>
                    {confirmAction ? (
                        <>
                            <button style={{ marginRight: '10px' }} onClick={onConfirm}>OK</button>
                            <button onClick={onCancel}>Cancel</button>
                        </>
                    ) : (
                        <button onClick={onCancel}>OK</button>
                    )}
                </div>
            </div>
        );
    };


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
                zIndex: 1000,
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


    if (isFinished) {
        const userLevel = determineLevel(score);
        const timeTaken = 5 * 60 - timeRemaining;
        const userDisplayScore = correctByDifficulty['Easy'] + correctByDifficulty['Medium'] + correctByDifficulty['Hard'];
        return (
            <div>
                <h2>Results: {props.userName}</h2>
                <p>Topic: Psychometric Test</p>
                <p>Cognitive Ability Level: {determineLevel(cognitiveScore)}</p>
                <p>Situational Judgement Level: {determineLevelSJT(situationalScore)}</p>
                {/* <div style={{ color: getColorForLevel(userLevel) }}>
                    Your Level: {userLevel}
                </div> */}
                <p>Personality Test Characteristics:</p>
                <ul>
                    {userCharacteristics.map((characteristic, index) => (
                        <li key={index}>{characteristic}</li>
                    ))}
                </ul>
                <div>
                    Total Time Taken: {formatTime(timeTaken)}
                </div>
                
            </div>
        );
    }

    if (showReadinessPopup) {
        return <TestDetails onStartTest={handleReady} />;
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {/* Timer at the top */}
            <div style={{ alignSelf: 'flex-end', padding: '10px', margin: '10px' }}>
                Time Remaining: {formatTime(timeRemaining)}
            </div>

            {/* Main content area */}
            <div style={{ width: '600px', textAlign: 'center', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                {/* Question Box */}
                <div style={{ margin: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '4px' }}>
                    <div>Section: {currentTopic}</div>
                    <div>Question {questionsAttempted + 1} of 15</div>
                    <div style={{ margin: '20px 0' }}>{questionsList[currentQuestion].question_text}</div>
                    {/* {console.log('Rendering question:', questionsList[currentQuestion])} */}
                    {/* Options Box */}
                    <div style={{ padding: '15px', backgroundColor: 'white', marginBottom: '20px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        {Array.isArray(questionsList[currentQuestion]?.options) && questionsList[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '10px 15px',
                                    margin: '10px 0',
                                    textAlign: 'left',
                                    backgroundColor: selectedOption === option ? '#e0e0e0' : 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px'
                                }}>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', width: '600px' }}>
                {questionsAttempted >= 14 // Show submit button when all 15 questions have been attempted
                    ? <button onClick={handleSubmitTest}>Submit Test</button>
                    : <button onClick={handleNextButtonClick}>Next</button>}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                message={modalMessage}
                onConfirm={confirmSelection}
                onCancel={cancelSelection}
                confirmAction={confirmAction}
            />

        </div>
    );

};

export default App;