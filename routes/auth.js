const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');

const SECRET = 'segredo_supersecreto';

// Cadastro
router.post('/register', async (req, res) => {
  const { email, password, nome_completo } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    if (!password || password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres, incluindo letras e números.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword, nome_completo]
    );

    const token = jwt.sign({ userId: result.rows[0].id }, SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });

    // Retornando token e nome do usuário
    res.json({ token, name: user.name });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
