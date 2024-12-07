import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import "../App.css";

const Crossword = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [code, setCode] = useState("");
  const [showRedeemInput, setShowRedeemInput] = useState(false);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [showRedeemButton, setShowRedeemButton] = useState(false); // State to manage redeem button visibility

  // Create references to the audio elements
  const audioRef = useRef(new Audio("/christmas-sound.mp3"));
  const notificationAudioRef = useRef(new Audio("/notification-sound.mp3"));

  useEffect(() => {
    // Fetch crossword questions from the backend
    axios
      .get("http://localhost:5000/crossword")
      .then((res) => {
        setQuestions(res.data);
        setAnswers(new Array(res.data.length).fill("")); // Initialize empty answers
      })
      .catch((err) => console.error(err));
  }, []);

  const validateAnswers = () => {
    // Map the answers into the required format
    const formattedAnswers = answers.map((answer, index) => ({
      id: questions[index].id, // Assuming 'questions' has the 'id' property
      answer: answer,
    }));

    axios
      .post("http://localhost:5000/check-answer", { answers: formattedAnswers })
      .then((res) => {
        if (res.data.success) {
          setIsComplete(true);

          // Play the audio when answers are correct
          audioRef.current.play();

          // Set a timer to show the redeem button after 2 minutes
          setTimeout(() => {
            setShowRedeemButton(true); // Show redeem button after 2 minutes

            // Play the notification sound when the redeem button appears
            notificationAudioRef.current.play();
          }, 120000); // 2 minutes in milliseconds
        } else {
          alert(res.data.message); // Show the error message if not all answers are correct
        }
      })
      .catch((err) => console.error(err));
  };

  const handleRedeemClick = () => {
    setShowRedeemInput(true);
  };

  const handleCodeSubmit = () => {
    if (code === "0304") {
      setIsCodeCorrect(true);
    } else {
      alert("Incorrect code. Try again!");
    }
  };

  const handleInputChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  return (
    <div className="crossword-container">
      {isCodeCorrect && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      <h1>Christmas Crossword</h1>
      <ul>
        {questions.map((q, index) => (
          <li key={q.id}>
            {q.question}
            <input
              type="text"
              value={answers[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          </li>
        ))}
      </ul>
      <button onClick={validateAnswers}>Check Answers</button>

      {isComplete && !showRedeemButton && (
        <div>
          <p>🎉 All answers are correct! Collect Your Gift 🎁</p>
          {/* <p>Please wait while we prepare your gift...</p> */}
        </div>
      )}

      {showRedeemButton && (
        <div className="redeem-btn-container">
          <button onClick={handleRedeemClick}>Redeem Gift</button>
        </div>
      )}

      {showRedeemInput && (
        <div>
          <p>Enter the code to unlock your gift:</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleCodeSubmit}>Submit</button>
        </div>
      )}

      {isCodeCorrect && <p>🎉 Open your surprise gift now! 🎁</p>}
    </div>
  );
};

export default Crossword;
