const express = require('express');
const cors = require('cors');
const app = express();

// Libera o acesso da origem do frontend
app.use(cors({
  origin: 'https://seufrontend.onrender.com', // substitua pelo domínio real do seu frontend
  credentials: true // se for usar cookies/sessão
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