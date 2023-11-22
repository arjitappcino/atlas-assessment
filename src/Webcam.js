import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const Webcam = ({ onNoFaceDetected, isTestFinished }) => {
    const videoRef = useRef(null);
    const [initializing, setInitializing] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = process.env.PUBLIC_URL + '/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            setInitializing(false);
        };
        loadModels();

        // return () => {
        //     // Cleanup function to stop the webcam stream when the component unmounts
        //     stopWebcamStream();
        //   };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => {
                console.error("Error starting video stream:", err);
            });
    };

    // useEffect(() => {
    //     if (isTestFinished) {
    //       // Stop the webcam stream when the test is finished
    //       stopWebcamStream();
    //     }
    //   }, [isTestFinished]);
    
    //   const stopWebcamStream = () => {
    //     if (videoRef.current && videoRef.current.srcObject && isCameraOn) {
    //       videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    //       videoRef.current.srcObject = null;
    //       setIsCameraOn(false); // Update the state to reflect that the camera is now off
    //     }
    //   };

    useEffect(() => {
        if (!initializing) {
            startVideo();
        }
    }, [initializing]);

    useEffect(() => {
        if (!initializing) {
            let noFaceTimer = null;

            videoRef.current.addEventListener('play', () => {
                const canvas = faceapi.createCanvasFromMedia(videoRef.current);
                document.body.append(canvas);

                const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
                faceapi.matchDimensions(canvas, displaySize);

                const detect = async () => {
                    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions());

                    if (detections.length === 0) {
                        if (!noFaceTimer) {
                            noFaceTimer = setTimeout(() => {
                                // If no face detected for more than 10 seconds
                                onNoFaceDetected();
                            }, 10000);

                        }
                    } else {
                        clearTimeout(noFaceTimer);
                        noFaceTimer = null;
                    }

                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    faceapi.draw.drawDetections(canvas, resizedDetections);
                };

                setInterval(detect, 100);
            });
        }
    }, [initializing]);

    if (initializing) {
        return <div>Initializing...</div>;
    }

    return (
        // Return the video element or a message if the camera is off
        isCameraOn ? (
          <video ref={videoRef} autoPlay muted width="200" height="150" />
        ) : (
          <div>Camera off</div>
        )
      );
};

export default Webcam;
