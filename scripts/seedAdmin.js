const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db.js');
const Admin = require('../models/Admin.js');

dotenv.config();

const seed = async () => {
  // Defensive trim — Render's UI sometimes leaves a trailing newline when
  // pasting env values, which silently breaks username/password matching.
  const username = (process.env.ADMIN_USER || '').trim();
  const password = (process.env.ADMIN_PASSWORD || '').trim();

  if (!username || !password) {
    console.error('ADMIN_USER and ADMIN_PASSWORD must be set in .env.');
    process.exit(1);
  }

  console.log(`Seeding admin user="${username}" (password length=${password.length})`);

  const hash = await bcrypt.hash(password, 10);
  console.log(`Generated bcrypt hash (length=${hash.length}, prefix=${hash.slice(0, 7)})`);

  const existing = await Admin.findOne({ username });
  const admin = await Admin.findOneAndUpdate(
    { username },
    { username, password: hash },
    { upsert: true, new: true }
  );

  if (existing) {
    console.log(`Updated existing admin "${admin.username}" (password re-hashed from .env).`);
  } else {
    console.log(`Created admin "${admin.username}".`);
  }

  // Round-trip verify so seed failures are loud, not silent.
  const ok = await bcrypt.compare(password, admin.password);
  console.log(`Self-check (compare .env password to stored hash): ${ok}`);
  if (!ok) {
    console.error('Self-check FAILED. The stored hash does not match the password. Aborting.');
    process.exit(1);
  }
};

connectDB()
  .then(seed)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
