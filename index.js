const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const forumRoutes = require('./routes/forum');
const eventsRoutes = require('./routes/events');
const fileRoutes = require('./routes/file'); // <-- nova rota de arquivos

// Servir arquivos da pasta uploads (ex: http://localhost:3001/uploads/nome-do-arquivo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Usar as rotas
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', forumRoutes);
app.use('/api', eventsRoutes);
app.use('/api', fileRoutes); // <-- aplica rota de upload sob /api

// Porta
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
