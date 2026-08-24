const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db.js');
const Admin = require('../models/Admin.js');

dotenv.config();

const seed = async () => {
    const username = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        console.error('ADMIN_USER and ADMIN_PASSWORD must be set in .env.');
        process.exit(1);
    }

    const existing = await Admin.findOne({ username });
    const hash = await bcrypt.hash(password, 10);
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
};

connectDB()
    .then(seed)
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
