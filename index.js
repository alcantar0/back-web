const express = require('express');
const app = express();
app.use(express.json());

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

app.use('/api', authRoutes);
app.use('/api', profileRoutes);

app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});