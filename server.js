const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// MS SQL Server configuration
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Registration route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // Include email

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('username', mssql.NVarChar, username)
      .input('email', mssql.NVarChar, email) // Insert email
      .input('password', mssql.NVarChar, password)
      .query('INSERT INTO Users (username, email, password) VALUES (@username, @email, @password)');
    
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
