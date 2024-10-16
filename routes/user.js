const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// formater fecha
const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('sv-SE', options).format(date).replace(' ', 'T').replace('T', ' ');
};

const lastAccess = formatDate(new Date());

//Register user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, password, last_access_date) VALUES (?, ?, ?)`,
        [username, hashedPassword, lastAccess], (err) => {
            if (err) return res.status(500).send("Error al crear usuario");
            res.status(201).send('Usuario Registrado');
        });
});

// Login User
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).send('Datos invalidos');
        }

        // Actualizar la fecha de último acceso
        const lastAccess = formatDate(new Date()); 
        db.run(`UPDATE users SET last_access_date = ? WHERE id = ?`, [lastAccess, user.id], (err) => {
            if (err) {
                return res.status(500).send('Error al actualizar la fecha de último acceso');
            }

            // Generar el token
            const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
            res.status(200).json({ token });
        });
    });
});

module.exports = router;