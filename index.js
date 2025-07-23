const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Habilita CORS para o frontend local
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // adicione aqui os domínios do front
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
const forumRoutes = require('./routes/forum');
app.use('/api', forumRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});