const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');

const SECRET = 'segredo_supersecreto';

router.get('/perfil', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' });

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, SECRET);
    const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [payload.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;