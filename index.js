const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const forumRoutes = require('./routes/forum');
const eventsRoutes = require('./routes/events');
const fileRoutes = require('./routes/file');
const materialRoutes = require('./routes/materials');



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', forumRoutes);
app.use('/api', eventsRoutes);
app.use('/api', fileRoutes);
app.use('/api', materialRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
