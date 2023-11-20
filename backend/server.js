const express = require('express');
const db = require('./database');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/savePerformance', (req, res) => {
    const data = req.body;
    const query = 'INSERT INTO userPerformanceData SET ?';

    db.query(query, data, (error, results) => {
        if (error) throw error;
        res.json({ id: results.insertId });
    });
});

app.get('/getQuestions', (req, res) => {
    dbConnection.query('SELECT * FROM questionBank', (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send('Error fetching questions from the database');
        }
        res.json(results);
    });
});

app.get('/questionBank', (req, res) => {
    db.query('SELECT * FROM questionBank', (err, result) => {
      if (err) {
        res.status(500).send('Server error');
        console.error(err);
      } else {
        res.json(result);
      }
    });
  });
  
  // Example of a GET endpoint to fetch questions by difficulty
  app.get('/questionBank/difficulty/:difficulty', (req, res) => {
    const difficulty = req.params.difficulty;
    db.query('SELECT * FROM questionBank WHERE difficulty = ?', [difficulty], (err, result) => {
      if (err) {
        res.status(500).send('Server error');
        console.error(err);
      } else {
        res.json(result);
      }
    });
  });
  
  app.get('/questionBank/topic/:topic', (req, res) => {
    const topic = req.params.topic;
    console.log("I was here first");
    db.query('SELECT * FROM questionBank WHERE topic = ?', [topic], (err, result) => {
      if (err) {
        res.status(500).send('Server error');
        console.error(err);
        console.log("I couldn't make it");
      } else {
        res.json(result);
        console.log("I was here second");
      }
    });
  });

  app.get('/revisedQuestionBank/difficulty/:difficulty', (req, res) => {
    const difficulty = req.params.difficulty;
    db.query('SELECT * FROM revisedQuestionBank WHERE difficulty = ?', [difficulty], (err, result) => {
      if (err) {
        res.status(500).send('Server error');
        console.error(err);
      } else {
        res.json(result);
      }
    });
  });

  app.get('/revisedQuestionBank/topic/:topic', (req, res) => {
    const topic = req.params.topic;
    console.log("I was accessed - revisedQuestionBank");
    db.query('SELECT * FROM revisedQuestionBank WHERE topic = ?', [topic], (err, result) => {
      if (err) {
        res.status(500).send('Server error');
        console.error(err);
        console.log("Server error ");
      } else {
        res.json(result);
        console.log("Completed successfully - revisedQuestionBank");
      }
    });
  });

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Questions API below


