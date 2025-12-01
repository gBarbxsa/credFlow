const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Importa a nossa nova conexão segura do arquivo db.js
const { sql, poolPromise } = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../credflow')));

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

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long...' });
        }

        // 1. Obtém o pool de conexões (garante que está conectado)
        const pool = await poolPromise;

        // 2. Verifica se usuário existe
        const checkUser = await pool.request()
            .input('Email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE Email = @Email');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insere o usuário
        await pool.request()
            .input('Name', sql.VarChar, name)
            .input('Email', sql.VarChar, email)
            .input('PasswordHash', sql.VarChar, hashedPassword)
            .query('INSERT INTO Users (Name, Email, PasswordHash) VALUES (@Name, @Email, @PasswordHash)');

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

        const pool = await poolPromise; // Espera o pool

        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE Email = @Email');
            
        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.PasswordHash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.Id, name: user.Name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.Id, name: user.Name, email: user.Email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Transacao
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('UserId', sql.Int, req.user.id)
            .query('SELECT * FROM Transactions WHERE UserId = @UserId ORDER BY Date DESC');

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Adicionar Transacao
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { description, value, type, category } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input('UserId', sql.Int, req.user.id)
            .input('Description', sql.NVarChar(255), description) 
            .input('Value', sql.Decimal(18, 2), value) 
            .input('Type', sql.NVarChar(20), type)
            .input('Category', sql.NVarChar(50), category)
            .query('INSERT INTO Transactions (UserId, Description, Value, Type, Category, Date) VALUES (@UserId, @Description, @Value, @Type, @Category, GETDATE())');

        res.status(201).json({ message: 'Transaction added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Apagar Transacao
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Id', sql.Int, id)
            .input('UserId', sql.Int, req.user.id)
            .query('DELETE FROM Transactions WHERE Id = @Id AND UserId = @UserId');

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