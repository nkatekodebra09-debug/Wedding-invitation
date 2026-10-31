const nodemailer = require('nodemailer');

const requiredSettings = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM'];

function getTransporter() {
    if (requiredSettings.some((setting) => !process.env[setting])) return null;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendRsvpConfirmation({ name, email, attending, attendeeCount }) {
    const transporter = getTransporter();
    if (!transporter) {
        console.warn('RSVP confirmation email skipped: SMTP environment variables are not configured.');
        return false;
    }

    const safeName = escapeHtml(name);
    const attendanceText = attending
        ? `We are delighted that you will be joining us with ${attendeeCount} ${attendeeCount === 1 ? 'person' : 'people'} in your party.`
        : 'We are sorry that you will not be able to join us, and we appreciate you letting us know.';
    const location = 'Ka-Dzumeri, 0833, Giyani, Limpopo (house next to Dzumeri AOG)';

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Thank you for your RSVP | Tshepo & Sandisile',
        text: `Dear ${name},\n\nThank you for your RSVP. ${attending ? `We are delighted that you will be joining us with ${attendeeCount} ${attendeeCount === 1 ? 'person' : 'people'} in your party.` : 'We are sorry that you will not be able to join us, and we appreciate you letting us know.'}\n\nWelcoming ceremony\nSunday, 20 December 2026 at 10:00 in the morning\nVenue: ${location}\nDress theme: All shades of purple, or traditional attire of your choice.\n\nWith love,\nTshepo & Sandisile`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#3e2d4b;max-width:600px;margin:auto"><h1 style="color:#533c6c">Thank you, ${safeName}!</h1><p>${attendanceText}</p><h2 style="color:#73558f">Welcoming ceremony</h2><p><strong>Sunday, 20 December 2026</strong><br>10:00 in the morning</p><p><strong>Venue:</strong><br>${location}</p><p><strong>Dress theme:</strong><br>All shades of purple, or traditional attire of your choice.</p><p>We look forward to celebrating this special day with you.</p><p>With love,<br><strong>Tshepo &amp; Sandisile</strong></p></div>`,
    });

    return true;
}

module.exports = { sendRsvpConfirmation };
