const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Admin = require('../models/Admin.js');
const connectDB = require('../config/db.js');

dotenv.config();

const safe = (value) => {
  if (value === undefined || value === null) return '<unset>';
  if (value === '') return '<empty string>';
  return `len=${String(value).length}`;
};

async function diagnose() {
  console.log('--- env vars ---');
  console.log('ADMIN_USER    :', safe(process.env.ADMIN_USER), JSON.stringify(process.env.ADMIN_USER));
  console.log('ADMIN_PASSWORD:', safe(process.env.ADMIN_PASSWORD));
  console.log('MONGO_URI set :', Boolean(process.env.MONGO_URI));
  console.log('JWT_SECRET set:', Boolean(process.env.JWT_SECRET));

  console.log('\n--- bcrypt sanity ---');
  const testHash = await bcrypt.hash('hello', 10);
  const testOk = await bcrypt.compare('hello', testHash);
  console.log('bcrypt round-trip works:', testOk);
  console.log('test hash starts with:  ', testHash.slice(0, 7), '(expected $2b$10$)');

  await connectDB();
  console.log('\n--- stored admins ---');
  const all = await Admin.find({});
  console.log(`Found ${all.length} admin record(s).`);
  all.forEach((a, i) => {
    console.log(`  [${i}] username=${JSON.stringify(a.username)} hashLen=${a.password?.length} hashStart=${JSON.stringify(a.password?.slice(0, 7))}`);
  });

  if (process.env.ADMIN_USER && process.env.ADMIN_PASSWORD) {
    const target = await Admin.findOne({ username: process.env.ADMIN_USER });
    if (!target) {
      console.log(`\nNo admin found with username=${JSON.stringify(process.env.ADMIN_USER)}`);
    } else {
      const ok = await bcrypt.compare(process.env.ADMIN_PASSWORD, target.password);
      console.log(`\nbcrypt.compare(envPassword, storedHash): ${ok}`);
    }
  }

  await mongoose.disconnect();
}

diagnose().catch((err) => {
  console.error('diagnose failed:', err);
  process.exit(1);
});
