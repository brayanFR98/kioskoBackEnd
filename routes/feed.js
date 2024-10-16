const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Middleware for verifcation autentication JWT
router.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).send('Acceso denegado');
    jwt.verify(token, 'secret', (err, user) => {
        if (err) return res.status(403).send('Token inválido');
        req.user = user;
        next();
    });
});

const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('sv-SE', options).format(date).replace(' ', 'T').replace('T', ' ');
};

router.post('/feeds', (req, res) => {
    const { name, topics, isPublic, type, editorial, language } = req.body;
    // console.log('Public Value:', isPublic);
    if (!name || !topics || topics.length === 0 || topics.length > 5 || !type || !editorial || !language) {
        return res.status(400).send('Datos inválidos para el feed');
    }

    const createdAt = formatDate(new Date());
    const updatedAt = createdAt; // Si se crea, la fecha de actualización es la misma

    db.run(`INSERT INTO feeds (name, topics, public, type, editorial, language, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, topics.join(','), isPublic, type, editorial, language, req.user.id, createdAt, updatedAt], (err) => {
            if (err) return res.status(500).send('Error creando feed');
            res.status(201).send('Feed creado');
        });
});

router.get('/feeds', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { topic, orderBy } = req.query; // Obtener los parámetros de búsqueda y ordenación

    let query = `SELECT f.*, u.username FROM feeds f INNER JOIN users u ON f.user_id = u.id WHERE (f.user_id = ? OR f.public = 1)`;
    const params = [req.user.id];

    // Filtrar por topic
    if (topic) {
        query += ` AND topics LIKE ?`;
        params.push(`%${topic}%`);
    }

    // Ordenar
    if (orderBy === 'created_at') {
        query += ` ORDER BY created_at DESC`;
    } else if (orderBy === 'updated_at') {
        query += ` ORDER BY updated_at DESC`;
    }

    // contar
    db.get(`SELECT COUNT(*) as totalFeeds FROM feeds WHERE user_id = ? AND topics LIKE ? OR public = 1`, 
        [req.user.id, `%${topic}%`], (err, result) => {
        if (err) return res.status(500).send('Error contando los feeds');

        const totalFeeds = result.totalFeeds;

        // obtener los feeds paginados
        db.all(`${query} LIMIT ? OFFSET ?`, [...params, limit, offset], (err, feeds) => {
            if (err) return res.status(500).send('Error obteniendo feeds');

            const feedsWithArrayTopics = feeds.map(feed => ({
                ...feed,
                topics: feed.topics.split(',')
            }));

            res.status(200).json({
                feeds: feedsWithArrayTopics,
                totalFeeds // Devolver también el total de feeds
            });
        });
    });
});

// Actualizar un feed existente
router.put('/feeds/:id', (req, res) => {
    const { id } = req.params;
    const { name, topics, isPublic, type, editorial, language } = req.body;

    if (!name || !topics || topics.length === 0 || topics.length > 5 || !type || !editorial || !language) {
        return res.status(400).send('Datos inválidos para el feed');
    }

    const updatedAt = formatDate(new Date());

    db.run(
        `UPDATE feeds SET name = ?, topics = ?, public = ?, type = ?, editorial = ?, language = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
        [name, topics.join(','), isPublic, type, editorial, language, updatedAt, id, req.user.id],
        function (err) {
            if (err) return res.status(500).send('Error actualizando el feed');
            if (this.changes === 0) return res.status(404).send('Feed no encontrado o sin permisos');
            res.status(200).send('Feed actualizado');
        }
    );
});


// Eliminar un feed
router.delete('/feeds/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM feeds WHERE id = ? AND user_id = ?`, [id, req.user.id], function (err) {
        if (err) return res.status(500).send('Error eliminando el feed');
        if (this.changes === 0) return res.status(404).send('Feed no encontrado o sin permisos');
        res.status(200).send('Feed eliminado');
    });
});



module.exports = router;