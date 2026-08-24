const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const connectDB = require('../config/db.js');
const Invitee = require('../models/Invitee.js');

dotenv.config();

const INVITEES_FILE = path.join(__dirname, '..', 'invitees.json');

const pad = (str, len) => (str + ' '.repeat(len)).slice(0, len);

const seed = async () => {
    if (!fs.existsSync(INVITEES_FILE)) {
        console.error(`Missing ${INVITEES_FILE}. Create it with { "invitees": [{ "name": "...", "email": "..." }] }.`);
        process.exit(1);
    }

    const raw = fs.readFileSync(INVITEES_FILE, 'utf8');
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        console.error(`Could not parse ${INVITEES_FILE}: ${err.message}`);
        process.exit(1);
    }

    const entries = Array.isArray(parsed.invitees) ? parsed.invitees : [];
    if (entries.length === 0) {
        console.error('No invitees found in invitees.json.');
        process.exit(1);
    }

    const rows = [];

    for (const entry of entries) {
        if (!entry || !entry.name || !entry.email) {
            console.warn(`Skipping entry without name/email: ${JSON.stringify(entry)}`);
            continue;
        }
        const email = String(entry.email).toLowerCase().trim();
        const name = String(entry.name).trim();
        const token = crypto.randomBytes(32).toString('hex');
        const invitee = await Invitee.findOneAndUpdate(
            { email },
            { $setOnInsert: { name, email, token, rsvpSubmitted: false } },
            { upsert: true, new: true }
        );
        rows.push({ name: invitee.name, email: invitee.email, token: invitee.token });
    }

    const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const nameW = Math.max(4, ...rows.map(r => r.name.length));
    const emailW = Math.max(5, ...rows.map(r => r.email.length));
    const tokenW = Math.max(5, ...rows.map(r => r.token.length));
    const urlW = Math.max(3, ...rows.map(r => `${base}/?token=${r.token}#rsvp`.length));

    console.log('');
    console.log(pad('Name', nameW), pad('Email', emailW), pad('Token', tokenW), pad('URL', urlW));
    console.log(pad('-'.repeat(nameW), nameW), pad('-'.repeat(emailW), emailW), pad('-'.repeat(tokenW), tokenW), pad('-'.repeat(urlW), urlW));
    for (const r of rows) {
        const url = `${base}/?token=${r.token}#rsvp`;
        console.log(pad(r.name, nameW), pad(r.email, emailW), pad(r.token, tokenW), pad(url, urlW));
    }
    console.log('');
    console.log(`Seeded ${rows.length} invitee(s). Re-running this script will NOT regenerate tokens for existing emails.`);
};

connectDB()
    .then(seed)
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
