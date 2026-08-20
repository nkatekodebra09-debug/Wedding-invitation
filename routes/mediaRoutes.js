const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const assetDirectory = path.join(__dirname, '..', 'public', 'assets');
fs.mkdirSync(assetDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, assetDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = file.fieldname === 'image' ? `bride-groom${extension}` : `weddingSong${extension}`;
    callback(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = file.fieldname === 'image'
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    callback(null, allowed.includes(file.mimetype));
  }
});

router.post('/upload', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), (req, res) => {
  res.json({
    message: 'Media uploaded successfully.',
    image: req.files?.image?.[0] ? '/assets/' + req.files.image[0].filename : null,
    audio: req.files?.audio?.[0] ? '/assets/' + req.files.audio[0].filename : null
  });
});

module.exports = router;
