const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../credflow')));

// Database Configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: false // Change to true for local dev / self-signed certs
    }
};

// Connect to Database
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to Azure SQL Database');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}
connectDB();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Email Format Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password Complexity Validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' });
        }

        // Check if user exists
        const checkUser = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        await sql.query`INSERT INTO Users (Name, Email, PasswordHash) VALUES (${name}, ${email}, ${hashedPassword})`;

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.PasswordHash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user.Id, name: user.Name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.Id, name: user.Name, email: user.Email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Transactions WHERE UserId = ${req.user.id} ORDER BY Date DESC`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { description, value, type, category } = req.body;

        await sql.query`INSERT INTO Transactions (UserId, Description, Value, Type, Category, Date) 
                        VALUES (${req.user.id}, ${description}, ${value}, ${type}, ${category}, GETDATE())`;

        res.status(201).json({ message: 'Transaction added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Transaction
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership and delete
        const result = await sql.query`DELETE FROM Transactions WHERE Id = ${id} AND UserId = ${req.user.id}`;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
