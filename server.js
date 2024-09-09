const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const app = express();
const secretKey = 'yourSecretKey'; // You should store this in a secure place, not hardcoded

let users = []; // In-memory storage for users

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'revathi.e.v3166@gmail.com', // replace with your email
        pass: 'Revs@271014'    // replace with your email password
    }
});

// Generate OTP
function generateOTP() {
    return otpGenerator.generate(6, { upperCase: false, specialChars: false });
}

// Send OTP Email
function sendOtpEmail(email, otp) {
    const mailOptions = {
        from: 'revathi.e.v3166@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`
    };

    return transporter.sendMail(mailOptions);
}

// Store OTP and Expiry in memory (or database)
let otpStore = {};

// Serve the index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Request OTP Route
app.post('/sendOtp', (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore[email] = { otp, expiry: otpExpiry };

    sendOtpEmail(email, otp)
        .then(() => {
            res.json({ success: true, message: 'OTP sent to your email' });
        })
        .catch(err => {
            console.error('Error sending OTP:', err);
            res.json({ success: false, message: 'Failed to send OTP' });
        });
});

// Verify OTP Route
app.post('/verifyOtp', (req, res) => {
    const { email, otp } = req.body;

    // Check if OTP exists for the email
    if (!otpStore[email]) {
        return res.status(400).json({ success: false, message: 'No OTP found. Please request an OTP first.' });
    }

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expiry) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
    }

    if (storedOtp.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    delete otpStore[email]; // OTP verified, remove from store
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
});

// Sign Up Route
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if OTP is provided and validate it
    if (!otpStore[email]) {
        return res.status(400).json({ message: 'No OTP found. Please request an OTP first.' });
    }

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expiry) {
        delete otpStore[email];
        return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    if (storedOtp.otp !== req.body.otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user
    users.push({ name, email, password: hashedPassword, topics: [] });
    delete otpStore[email];
    res.status(200).json({ message: 'User registered successfully. Please sign in.' });
});

// Sign In Route
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Sign in successful', token });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }
        req.email = decoded.email; // Extract email from token
        next();
    });
};

// Save Topics Route (Requires JWT authentication)
app.post('/savetopics', verifyToken, (req, res) => {
    const { topics } = req.body;

    // Find the user using email extracted from the token
    const user = users.find(user => user.email === req.email);
    if (user) {
        user.topics = topics;
        return res.status(200).json({ message: 'Topics saved successfully', topics: user.topics });
    }

    return res.status(400).json({ message: 'User not found' });
});

// Get Topics Route (Requires JWT authentication)
app.post('/gettopics', verifyToken, (req, res) => {
    const email = req.body.email;

    // Find the user using email
    const user = users.find(user => user.email === email);
    if (user) {
        return res.status(200).json({ topics: user.topics });
    }

    return res.status(400).json({ message: 'User not found' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
