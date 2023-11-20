const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  database: 'atlasDB',
  user: 'root',
  password: 'Dragon12ball',
  port: 3306
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to the database!");
});

module.exports = connection;
