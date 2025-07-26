const express = require('express');
const router = express.Router();
const pool = require('../db'); // sua conexão PostgreSQL

// Listar todos os materiais
router.get('/materials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
});

// Adicionar novo material
router.post('/materials', async (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Campos obrigatórios' });

  try {
    await pool.query('INSERT INTO materials (title, url) VALUES ($1, $2)', [title, url]);
    res.status(201).json({ message: 'Material adicionado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar material' });
  }
});

module.exports = router;
