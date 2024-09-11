const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();
const saltRounds = 10;

// Temporarily store OTP and user data in memory
const userData = {};

// Nodemailer setup with Google App Password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'revathi.e.v3166@gmail.com',
    pass: 'hpyf tqvl ajmd bjhu' // Use the generated App Password here
  }
});

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blogging'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Could not connect to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html as the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Sign Up Route: Initiates sign-up process and sends OTP
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  console.log('Signup Request:', { email, password, name });

  // Check if the user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists. Please sign in.' });
    }

    // Generate OTP and store user data temporarily
    const otp = generateOTP();
    userData[email] = { name, password, otp }; // Store OTP along with user data

    console.log('Generated OTP:', otp);

    // Send OTP email
    const mailOptions = {
      from: 'revathi.e.v3166@gmail.com',
      to: email,
      subject: 'Your OTP for Verification',
      text: `Your OTP for verification for blogging page is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Error sending OTP email' });
      } else {
        res.json({ message: 'OTP sent to your email' });
      }
    });
  });
});

// OTP Verification Route: Verify OTP and register the user
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  console.log('Received OTP:', otp);

  // Check if the email exists in the temporary storage
  const user = userData[email];

  // Ensure that the OTP for the email is available and matches
  if (user && user.otp === otp) {
    const hashedPassword = bcrypt.hashSync(user.password, saltRounds);

    // Insert new user into the database
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [user.name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user data:', err);
        return res.status(500).json({ message: 'Error inserting user data.' });
      }

      // Clear temporary user data
      delete userData[email];

      res.status(200).json({ message: 'OTP verified, user registered successfully' });
    });
  } else {
    // Handle cases where OTP is invalid or does not exist
    if (!user) {
      console.log('No OTP stored for', email);
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    console.log('Invalid OTP for', email);
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// Sign In Route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Database error during sign-in:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // No JWT token, just respond with success
    res.status(200).json({ message: 'Sign in successful', email });
  });
});

// Save Topics Route
app.post('/savetopics', (req, res) => {
  const { email, topics } = req.body;

  // Ensure topics is an array and convert to JSON string
  if (!Array.isArray(topics)) {
    return res.status(400).json({ message: 'Topics should be an array' });
  }

  const topicsJson = JSON.stringify(topics);

  // Log the data to be inserted for debugging
  console.log('Saving topics for email:', email);
  console.log('Topics JSON:', topicsJson);

  // Update topics for the user in the database
  const sql = 'UPDATE users SET topics = ? WHERE email = ?';
  db.query(sql, [topicsJson, email], (err, result) => {
    if (err) {
      console.error('Error updating topics:', err);
      return res.status(500).json({ message: 'Error updating topics' });
    }
    res.status(200).json({ message: 'Topics saved successfully', topics });
  });
});

// Get Topics Route
app.post('/gettopics', (req, res) => {
  const { email } = req.body;

  // Find the user and get topics from the database
  db.query('SELECT topics FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error while fetching topics:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }
    const topics = JSON.parse(results[0].topics || '[]');
    res.status(200).json({ topics });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
