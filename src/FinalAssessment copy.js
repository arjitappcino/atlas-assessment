import React, { useState, useEffect } from 'react';

let questions = null;


const pointRules = {
    'Easy': { correct: 1, wrong: -0.75 },
    'Medium': { correct: 2, wrong: -0.5 },
    'Hard': { correct: 3, wrong: -0.25 },
};

const determineLevel = (score) => {
    const maxScore = 15;
    const minScore = -3.5;
    const range = maxScore - minScore;

    if (score <= minScore + 0.25 * range) return 'Beginner';
    if (score <= minScore + 0.5 * range) return 'Intermediate';
    if (score <= minScore + 0.75 * range) return 'Proficient';
    return 'Expert';
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

    // useEffect(() => {
    //     if (questionsAttempted < 5) {
    //         console.log('Fetching questions for difficulty:', currentDifficulty);
    //         fetchQuestionsFromAPI(`http://localhost:5000/revisedQuestionBank/difficulty/${currentDifficulty}`)
    //             .then(fetchedQuestions => {
    //                 if (fetchedQuestions && fetchedQuestions.length > 0) {
    //                     console.log('Setting new questions list:', fetchedQuestions);
    //                     setQuestionsList(fetchedQuestions);
    //                     setCurrentQuestion(0);
    //                 } else {
    //                     console.error("No questions fetched for difficulty:", currentDifficulty);
    //                 }
    //             });
    //         if (questionsList[currentQuestion]) {
    //             setDisplayedQuestionIds(prevIds => [...prevIds, questionsList[currentQuestion].id]);
    //         }
    //     } else {
    //         console.log('Finishing test after 5 questions');
    //         setIsFinished(true);
    //     }
    // }, [currentDifficulty, questionsAttempted]);

    useEffect(() => {
        const fetchQuestionsForCurrentTopic = async () => {
            const questions = await fetchQuestionsByTopic(currentTopic, currentTopic !== 'Personality Test');
            setQuestionsList(questions);
            setCurrentQuestion(0);
    
            // Update displayedQuestionIds with the new questions' IDs
            setDisplayedQuestionIds(prevIds => [...prevIds, ...questions.map(q => q.id)]);
        };
    
        // Fetch questions only if the user has interacted with the test (i.e., after answering the first question)
        if (questionsAttempted > 0) {
            if (questionsAttempted % 5 === 0 && questionsAttempted < 15) {
                let nextTopic;
                switch (currentTopic) {
                    case 'Cognitive Ability Test':
                        nextTopic = 'Situational Judgment Test';
                        break;
                    case 'Situational Judgment Test':
                        nextTopic = 'Personality Test';
                        break;
                    case 'Personality Test':
                    default:
                        nextTopic = 'Cognitive Ability Test';
                }
                setCurrentTopic(nextTopic);
                fetchQuestionsForCurrentTopic();
            }
        }
    }, [currentTopic, questionsAttempted]);
    


    useEffect(() => {

        async function handleWarning() {
            warnings += 1;
            if (warnings === 1) {
                alert("Warning: If you try to switch tabs or leave the page again, the test will be submitted automatically.");
            } else if (warnings > 1 && isFinished != true) {
                const user = {
                    assessmentType: 'final',
                    userName: props.userName,
                    userLevel: determineLevel(score),
                    topic: props.testTopic,
                    easyCorrectQuestions: correctByDifficulty['Easy'],
                    mediumCorrectQuestions: correctByDifficulty['Medium'],
                    hardCorrectQuestions: correctByDifficulty['Hard'],
                    totalCorrectQuestions: correctByDifficulty['Easy'] + correctByDifficulty['Medium'] + correctByDifficulty['Hard'],
                    totalTimeTaken: 5 * 60 - timeRemaining,
                    totalScore: 10
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
        setShowReadinessPopup(true);
        console.log(props.testTopic);
        console.log(`before clicked ready: ${questionsList}`);
    }, []);

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

    const calculateCombinedScore = () => {
        const averageEfficiency = efficiencyScores.reduce((acc, curr) => acc + curr, 0) / efficiencyScores.length;
        const weightedScore = 0.7 * score + 0.3 * (averageEfficiency * 100); // Assuming 100 is the maximum score
        setCombinedScore(weightedScore);
    };

    useEffect(() => {
        const fetchAndCombineQuestions = async () => {
            const cognitiveQuestions = await fetchQuestionsByTopic('Cognitive Ability Test');
            const situationalQuestions = await fetchQuestionsByTopic('Situational Judgment Test');
            const personalityQuestions = await fetchQuestionsByTopic('Personality Test', false);

            // Shuffle and pick questions
            const combinedQuestions = [
                ...shuffleArray(cognitiveQuestions).slice(0, 5),
                ...shuffleArray(situationalQuestions).slice(0, 5),
                ...shuffleArray(personalityQuestions).slice(0, 5)
            ];

            setQuestionsList(shuffleArray(combinedQuestions));
            setCurrentQuestion(0);
        };

        fetchAndCombineQuestions();
    }, [currentDifficulty]);


    // const fetchQuestionsFromAPI = async (apiEndpoint) => {
    //     try {
    //         const response = await fetch(apiEndpoint);
    //         const data = await response.json();
    //         // console.log('Fetched data:', data); // Log fetched data
    //         questions = data;
    //         return data;
    //     } catch (error) {
    //         console.error('Error fetching questions:', error);
    //         return null;
    //     }
    // };

    const fetchQuestionsFromAPI = async (apiEndpoint) => {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched data:', data); // Log fetched data
            return data || []; // Ensure to return an array even if data is null/undefined
        } catch (error) {
            console.error('Error fetching questions:', error);
            return []; // Return an empty array in case of an error
        }
    };
    


    const handleNoFaceDetected = () => {
        alert("No face detected for 10 seconds. The test will now close.");
        setIsFinished(true);
        saveUserDataToDB(userData);
    };

    const handleReady = () => {
        setShowReadinessPopup(false);
        setShowCountdown(true);
        setCountdown(3);
        console.log(`after clicked ready: ${questionsList}`);
        console.log(`options: ${questionsList[currentQuestion].options[1]}`);
        console.log(`current question index: ${currentQuestion}`);
    };

    const finishTest = async (userData) => {
        calculateCombinedScore();
        await saveUserDataToDB(userData).then(result => {
            if (result && result.success) {
                console.log('User data saved successfully');
            } else {
                console.error('Failed to save user data');
            }
        });
    }

    const handleOptionClick = (selectedOption) => {
        setSelectedOption(selectedOption);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };


    // const fetchNextQuestions = (difficulty, updatedDisplayedIds = []) => {
    //     console.log("Updated Displayed IDs:", updatedDisplayedIds);

    //     fetchQuestionsFromAPI(`http://localhost:5000/revisedQuestionBank/difficulty/${difficulty}`)
    //         .then(fetchedQuestions => {
    //             if (fetchedQuestions && fetchedQuestions.length > 0) {
    //                 // Use updatedDisplayedIds for filtering
    //                 const shuffledQuestions = shuffleArray(fetchedQuestions);
    //                 const filteredQuestions = shuffledQuestions.filter(q => !updatedDisplayedIds.includes(q.id));
    //                 if (filteredQuestions.length > 0) {
    //                     setQuestionsList(filteredQuestions);
    //                     setCurrentQuestion(0);
    //                 } else {
    //                     console.error("No new questions available for difficulty:", difficulty);
    //                     // Handle no new questions case
    //                 }
    //             } else {
    //                 console.error("No questions fetched for difficulty:", difficulty);
    //             }
    //         });
    // };

    const fetchQuestionsByTopic = async (topic, isAdaptive = true) => {
        let apiEndpoint = `http://localhost:5000/revisedQuestionBank/topic/${encodeURIComponent(topic)}`;
        if (isAdaptive) {
          apiEndpoint += `/difficulty/${currentDifficulty}`;
        }
      
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
          return data || [];
        } catch (error) {
          console.error('Error fetching questions for', topic, ':', error);
          return [];
        }
      };
      
    
    
    




    // const confirmSelection = () => {
    //     if (confirmAction) {
    //         const currentQuestionData = questionsList[currentQuestion];
    //         const correctAnswerIndex = currentQuestionData.answer;
    //         const correctAnswerValue = currentQuestionData.options[correctAnswerIndex];

    //         console.log('Selected option:', selectedOption);
    //         console.log('Correct answer index:', correctAnswerIndex);
    //         console.log('Correct answer value:', correctAnswerValue);

    //         let newDifficulty;
    //         if (selectedOption === correctAnswerValue) {
    //             console.log('Answer is correct. Updating score.');
    //             setScore(prevScore => prevScore + pointRules[currentDifficulty].correct);
    //             setCorrectByDifficulty(prev => ({
    //                 ...prev,
    //                 [currentDifficulty]: prev[currentDifficulty] + 1
    //             }));
    //             // Update difficulty based on current difficulty and score
    //             if (currentDifficulty === 'Easy') {
    //                 newDifficulty = 'Medium';
    //             } else if (currentDifficulty === 'Medium') {
    //                 newDifficulty = 'Hard';
    //             } else {
    //                 newDifficulty = currentDifficulty; // Stay at Hard
    //             }
    //         } else {
    //             console.log('Answer is incorrect. Updating score.');
    //             setScore(prevScore => prevScore + pointRules[currentDifficulty].wrong);
    //             // Update difficulty based on current difficulty
    //             if (currentDifficulty === 'Hard') {
    //                 newDifficulty = 'Medium';
    //             } else if (currentDifficulty === 'Medium') {
    //                 newDifficulty = 'Easy';
    //             } else {
    //                 newDifficulty = currentDifficulty; // Stay at Easy
    //             }
    //         }

    //         const newDisplayedIds = [...displayedQuestionIds, currentQuestionData.id];
    //         setDisplayedQuestionIds(newDisplayedIds);

    //         // Call fetchNextQuestions with the updated IDs
    //         setTimeout(() => {
    //             fetchNextQuestions(newDifficulty, newDisplayedIds);
    //         }, 0);

    //         setQuestionsAttempted(questionsAttempted + 1);
    //         setSelectedOption(null); // Reset the selected option
    //         setCurrentDifficulty(newDifficulty);
    //         fetchNextQuestions(newDifficulty);
    //     }

    //     setIsModalOpen(false);
    // };

    const confirmSelection = () => {
        if (confirmAction) {
            const currentQuestionData = questionsList[currentQuestion];
            const correctAnswerIndex = currentQuestionData.answer;
            const correctAnswerValue = currentQuestionData.options[correctAnswerIndex];
    
            console.log('Selected option:', selectedOption);
            console.log('Correct answer index:', correctAnswerIndex);
            console.log('Correct answer value:', correctAnswerValue);
    
            let newDifficulty;
            if (selectedOption === correctAnswerValue) {
                console.log('Answer is correct. Updating score.');
                setScore(prevScore => prevScore + pointRules[currentDifficulty].correct);
                setCorrectByDifficulty(prev => ({
                    ...prev,
                    [currentDifficulty]: prev[currentDifficulty] + 1
                }));
                if (currentTopic !== 'Personality Test') {
                    // Update difficulty based on current difficulty and score for adaptive topics
                    if (currentDifficulty === 'Easy') {
                        newDifficulty = 'Medium';
                    } else if (currentDifficulty === 'Medium') {
                        newDifficulty = 'Hard';
                    } else {
                        newDifficulty = currentDifficulty; // Stay at Hard
                    }
                }
            } else {
                console.log('Answer is incorrect. Updating score.');
                setScore(prevScore => prevScore + pointRules[currentDifficulty].wrong);
                if (currentTopic !== 'Personality Test') {
                    // Update difficulty based on current difficulty for adaptive topics
                    if (currentDifficulty === 'Hard') {
                        newDifficulty = 'Medium';
                    } else if (currentDifficulty === 'Medium') {
                        newDifficulty = 'Easy';
                    } else {
                        newDifficulty = currentDifficulty; // Stay at Easy
                    }
                }
            }
    
            // Add the ID of the current question to the list of displayed questions
            const newDisplayedIds = [...displayedQuestionIds, currentQuestionData.id];
            setDisplayedQuestionIds(newDisplayedIds);
    
            // Increment the count of questions attempted from the current topic
            if (questionsFromCurrentTopic >= 4) { // Switch topic after 5 questions
                const nextTopic = currentTopic === 'Cognitive Ability Test' ? 'Situational Judgment Test' :
                                  currentTopic === 'Situational Judgment Test' ? 'Personality Test' : 
                                  'Cognitive Ability Test'; // Loop back to the first topic
                setCurrentTopic(nextTopic);
                setQuestionsFromCurrentTopic(0);
                setCurrentDifficulty('Medium'); // Reset difficulty when topic changes
            } else {
                setQuestionsFromCurrentTopic(questionsFromCurrentTopic + 1);
                if (currentTopic !== 'Personality Test') {
                    setCurrentDifficulty(newDifficulty);
                }
            }
    
            // Reset the selected option and increment the number of questions attempted
            setSelectedOption(null);
            setQuestionsAttempted(questionsAttempted + 1);
        }
    
        setIsModalOpen(false);
    };
    


    const cancelSelection = () => {
        // Logic to handle cancellation goes here
        setIsModalOpen(false);
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
                assessmentType: 'final',
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

    const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
        if (!isOpen) return null;

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
                    <p>{message}</p>
                    {confirmAction ? (
                        <>
                            <button onClick={onConfirm}>OK</button>
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
                <p>Topic: {props.testTopic}</p>
                <p>Total Score: {userDisplayScore}/10</p>
                <div style={{ color: getColorForLevel(userLevel) }}>
                    Your Level: {userLevel}
                </div>
                <div>
                    Time Taken: {formatTime(timeTaken)}
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
                    <div>Question {questionsAttempted + 1} of 5</div>
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
                {currentQuestion === questionsList.length - 1
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