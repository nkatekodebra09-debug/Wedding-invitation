const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');

const guestRoutes = require('./routes/guestRoutes.js')
const viewRoutes = require('./routes/viewRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js');
const mediaRoutes = require('./routes/mediaRoutes.js');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.use('/api/guests', guestRoutes);
app.use('/api/views', viewRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/media', mediaRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/healthz", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

