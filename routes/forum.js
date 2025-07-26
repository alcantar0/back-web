const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = 'segredo_supersecreto';

// Middleware para autenticar e pegar userId do token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Criar pergunta
router.post('/questions', authMiddleware, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Título e corpo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO perguntas (user_id, title, body) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, title, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Listar perguntas
router.get('/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM perguntas ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Criar resposta para uma pergunta
router.post('/questions/:id/answers', authMiddleware, async (req, res) => {
  const { id: questionId } = req.params;
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Corpo da resposta é obrigatório' });
  }

  try {
    // Verifica se pergunta existe
    const question = await pool.query('SELECT * FROM perguntas WHERE id = $1', [questionId]);
    if (question.rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }

    const result = await pool.query(
      'INSERT INTO respostas (question_id, user_id, body) VALUES ($1, $2, $3) RETURNING *',
      [questionId, req.userId, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Listar respostas de uma pergunta
router.get('/questions/:id/answers', async (req, res) => {
  const { id: questionId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM respostas WHERE question_id = $1 ORDER BY created_at ASC',
      [questionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/answers/:id/vote', authMiddleware, async (req, res) => {
  const answerId = parseInt(req.params.id);
  const userId = req.userId;
  const { vote } = req.body; // deve ser 1 (upvote) ou -1 (downvote)

  if (![1, -1].includes(vote)) {
    return res.status(400).json({ error: 'O campo vote deve ser 1 ou -1' });
  }

  try {
    // 1. Verifica se a resposta existe
    const answerResult = await pool.query('SELECT * FROM respostas WHERE id = $1', [answerId]);
    if (answerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }

    // 2. Insere novo registro de voto (sem sobrescrever)
    await pool.query(
      'INSERT INTO answer_votes (answer_id, user_id, vote, created_at) VALUES ($1, $2, $3, NOW())',
      [answerId, userId, vote]
    );

    // 3. Incrementa o campo 'votes' na resposta
    await pool.query(
      'UPDATE respostas SET votes = votes + $1 WHERE id = $2',
      [vote, answerId]
    );

    res.json({ message: 'Voto registrado com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar voto:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});


router.get('/questions/:id/answers', async (req, res) => {
  const { id: questionId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        COALESCE(SUM(CASE WHEN av.vote THEN 1 ELSE -1 END), 0) AS votes
      FROM answers a
      LEFT JOIN answer_votes av ON av.answer_id = a.id
      WHERE a.question_id = $1
      GROUP BY a.id
      ORDER BY votes DESC, a.created_at ASC
    `, [questionId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;