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

app.post('/saveFinalPerformance', (req, res) => {
  const data = req.body;
  const query = 'INSERT INTO userFinalPerformanceRecord SET ?';

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

app.get('/revisedQuestionBank/topic/:topic/difficulty/:difficulty', (req, res) => {
  const { topic, difficulty } = req.params;
  db.query('SELECT * FROM revisedQuestionBank WHERE topic = ? AND difficulty = ?', [topic, difficulty], (err, result) => {
    if (err) {
      res.status(500).send('Server error');
      console.error(err);
    } else {
      res.json(result);
    }
  });
});


app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = results[0];

    // Direct password comparison
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, message: 'Login successful', userId: user.id, isAdmin: user.isAdmin }); // Send back user ID or other needed info
  });
});

app.post('/api/statusActive', (req, res) => {
  const { email } = req.body;

  db.query('UPDATE users SET status = "active" WHERE email = ?', [email], (updateError) => {
    if (updateError) {
      // Handle error, but the user has been authenticated so you may not want to fail the login process
      console.error('Failed to update user status to active:', updateError);
    }

    // Continue with login process
    res.status(200).json({ success: true, message: 'Login successful' });
  });
});

app.post('/api/logout', (req, res) => {
  const { email } = req.body;
  db.query('UPDATE users SET status = "inactive" WHERE email = ?', [email], (error) => {
    if (error) {
      // Handle error, but the user has been authenticated so you may not want to fail the login process
      console.error('Failed to update user status to inactive:', error);
    }
    res.status(200).json({ success: true, message: 'Logout successful' });
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Questions API below


