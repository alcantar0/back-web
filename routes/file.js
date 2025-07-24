const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Caminho absoluto para a pasta uploads
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📤 POST /upload - Enviar um arquivo
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  res.json({
    message: 'Arquivo salvo com sucesso!',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// 📥 GET /files - Listar todos os arquivos
router.get('/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar arquivos' });

    res.json(files);
  });
});

// 📄 GET /files/:filename - Baixar um arquivo específico
router.get('/files/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  res.sendFile(filePath);
});

// 🗑️ DELETE /files/:filename - Excluir um arquivo
router.delete('/files/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar arquivo' });

    res.json({ message: 'Arquivo excluído com sucesso' });
  });
});

module.exports = router;
