const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection configuration
const db = mysql.createConnection({
  host: "localhost", // or your MySQL server IP
  user: "root", // your MySQL username
  password: "password", // your MySQL password
  database: "crossword_game", // the database name
  port: 3306,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Fetch crossword data
app.get("/crossword", (req, res) => {
  const query = "SELECT id, question FROM crossword";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error fetching data.");
      console.error(err.message);
    } else {
      res.json(results);
    }
  });
});

// Verify answer
// app.post("/check-answer", (req, res) => {
//   const { id, answer } = req.body;
//   const query = "SELECT answer FROM crossword WHERE id = ?";
//   db.query(query, [id], (err, results) => {
//     if (err) {
//       res.status(500).send("Error verifying answer.");
//       console.error(err.message);
//     } else if (
//       results.length > 0 &&
//       results[0].answer === answer.toUpperCase()
//     ) {
//       res.json({ correct: true });
//     } else {
//       res.json({ correct: false });
//     }
//   });
// });

// app.post("/check-answer", (req, res) => {
//   const { answers } = req.body; // Array of answers

//   let correctAnswersCount = 0;
//   const totalQuestions = answers.length;

//   // Loop through answers and validate
//   answers.forEach(({ id, answer }) => {
//     const query = "SELECT answer FROM crossword WHERE id = ?";
//     db.query(query, [id], (err, results) => {
//       if (err) {
//         res
//           .status(500)
//           .send({ success: false, message: "Error verifying answer." });
//         console.error(err.message);
//       } else if (
//         results.length > 0 &&
//         results[0].answer === answer.toUpperCase()
//       ) {
//         correctAnswersCount++;
//       }

//       if (correctAnswersCount === totalQuestions) {
//         return res.json({ success: true });
//       }
//     });
//   });

//   // If not all answers are correct, return an error message
//   res.json({ success: false, message: "Some answers are incorrect." });
// });

// app.post("/check-answer", (req, res) => {
//   const { answers } = req.body; // Array of answers

//   let updatedAnswers = [...answers]; // Create a copy of the answers array to modify
//   let correctAnswersCount = 0;
//   const totalQuestions = answers.length;

//   // Loop through answers and validate
//   answers.forEach((answerObj, index) => {
//     const { id, answer } = answerObj;

//     const query = "SELECT answer FROM crossword WHERE id = ?";
//     db.query(query, [id], (err, results) => {
//       if (err) {
//         res
//           .status(500)
//           .send({ success: false, message: "Error verifying answer." });
//         console.error(err.message);
//       } else if (results.length > 0) {
//         const correctAnswer = results[0].answer;

//         // If the answer is correct, increment the counter
//         if (correctAnswer === answer.toUpperCase()) {
//           correctAnswersCount++;
//         } else {
//           // If the answer is incorrect, clear it (set to empty string)
//           updatedAnswers[index].answer = "";
//         }
//       }

//       // If all answers are correct, send success
//       if (correctAnswersCount === totalQuestions) {
//         return res.json({ success: true, updatedAnswers });
//       }

//       // If loop completes and not all answers are correct, return failure
//       if (
//         index === answers.length - 1 &&
//         correctAnswersCount !== totalQuestions
//       ) {
//         return res.json({
//           success: false,
//           message: "Some answers are incorrect.",
//           updatedAnswers, // Send back the partially corrected answers
//         });
//       }
//     });
//   });
// });

app.post("/check-answer", (req, res) => {
  const { answers } = req.body; // Array of answers

  let correctAnswersCount = 0;
  const totalQuestions = answers.length;

  // Loop through answers and validate
  answers.forEach((answerData, index) => {
    const { id, answer } = answerData; // Destructure id and answer from each answer object
    const query = "SELECT answer FROM crossword WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: "Error verifying answer." });
      }
      // Compare answers, making both lowercase for case-insensitive comparison
      if (
        results.length > 0 &&
        results[0].answer.trim().toLowerCase() === answer.trim().toLowerCase()
      ) {
        correctAnswersCount++;
      }

      // Check if all answers are correct
      if (correctAnswersCount === totalQuestions) {
        return res.json({ success: true });
      } else if (index === totalQuestions - 1) {
        return res.json({
          success: false,
          message: "Some answers are incorrect.",
        });
      }
    });
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
