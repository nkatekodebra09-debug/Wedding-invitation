const Invitee = require('../models/Invitee.js');

const ACCESS_COOKIE = 'invite_access';

function parseCookies(header = '') {
    return header.split(';').reduce((cookies, part) => {
        const separator = part.indexOf('=');
        if (separator === -1) return cookies;
        const name = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();
        if (name) cookies[name] = decodeURIComponent(value);
        return cookies;
    }, {});
}

function getInviteeAccessToken(req) {
    return parseCookies(req.headers.cookie)[ACCESS_COOKIE];
}

function setAccessCookie(res, token) {
    const attributes = [
        `${ACCESS_COOKIE}=${encodeURIComponent(token)}`,
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        'Max-Age=604800',
    ];
    if (process.env.NODE_ENV === 'production') attributes.push('Secure');
    res.setHeader('Set-Cookie', attributes.join('; '));
}

async function protectInvitation(req, res, next) {
    if (!['/', '/index.html'].includes(req.path)) return next();

    const token = req.query.token || getInviteeAccessToken(req);
    if (!token) {
        return res.status(401).send('This invitation requires a private invitation link.');
    }

    const invitee = await Invitee.findOne({ token }).select('_id token');
    if (!invitee) {
        return res.status(403).send('This invitation link is not valid.');
    }

    setAccessCookie(res, invitee.token);
    next();
}

module.exports = { getInviteeAccessToken, protectInvitation };
