/**
 * lib/cors.js — Shared CORS helper for all Blue Horizon API functions.
 * Usage inside a handler:
 *   const { setCors } = require('../lib/cors');
 *   if (setCors(req, res)) return res.status(200).end();
 *
 * Returns true if the request was an OPTIONS preflight (caller should return immediately).
 */

const ALLOWED_ORIGINS = [
    'https://bluehorizonoverseas.in',
    'https://www.bluehorizonoverseas.in',
];

// Allow localhost in development
if (process.env.NODE_ENV !== 'production') {
    ALLOWED_ORIGINS.push('http://localhost:3000');
    ALLOWED_ORIGINS.push('http://localhost:5500');
    ALLOWED_ORIGINS.push('http://127.0.0.1:5500');
}

/**
 * Sets CORS headers and returns true if the request is an OPTIONS preflight.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true = OPTIONS preflight, caller must return
 */
function setCors(req, res) {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    return req.method === 'OPTIONS';
}

module.exports = { setCors, ALLOWED_ORIGINS };
