const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/events', async (req, res) => {
    // Proximos eventos
    try {
        const result = await pool.query('SELECT * FROM eventos WHERE data_inicio >= NOW() ORDER BY data_inicio ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

router.get('/past-events', async (req, res) => {
    // Eventos passados
    try {
        const result = await pool.query('SELECT * FROM eventos WHERE data_inicio < NOW() ORDER BY data_inicio DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

router.post('/events', async (req, res) => {
    // Admin: Criar evento
    const { titulo, descricao, palestrante, data_inicio, duracao_minutos, localizacao, imagem_url } = req.body;

    if (!titulo || !descricao || !palestrante || !data_inicio || !duracao_minutos || !localizacao) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO eventos (titulo, descricao, palestrante, data_inicio, duracao_minutos, localizacao, imagem_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [titulo, descricao, palestrante, data_inicio, duracao_minutos, localizacao, imagem_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
})

router.patch('/events/:id', async (req, res) => {
    // Admin: Editar evento
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
    }

    try {
        // Constrói a query dinamicamente baseada nos campos fornecidos
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        
        const query = `UPDATE eventos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
        values.push(id);

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

module.exports = router;