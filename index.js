const express = require('express');
const app = express();
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