const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Connect to SQLite database
let db = new sqlite3.Database('./chatbot.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        sender TEXT NOT NULL,  -- 'user' or 'ai'
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users (id)
    )`);
});

// Endpoint to save messages
app.post('/api/messages', (req, res) => {
    const { user_id, message, sender } = req.body;
    db.run(`INSERT INTO Messages (user_id, message, sender) VALUES (?, ?, ?)`, [user_id, message, sender], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Endpoint to get messages
app.get('/api/messages', (req, res) => {
    db.all(`SELECT * FROM Messages ORDER BY timestamp ASC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
