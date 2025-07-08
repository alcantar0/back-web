const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET = 'segredo_supersecreto'; // em produção, use env

// Simulação de banco de dados em memória
const users = [
  {
    id: 1,
    email: 'teste@exemplo.com',
    password: bcrypt.hashSync('123456', 8), // senha já criptografada
  },
];

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Rota protegida
app.get('/perfil', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    const user = users.find(u => u.id === payload.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não existe' });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});