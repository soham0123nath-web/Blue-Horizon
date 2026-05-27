const { setCors } = require('../lib/cors');

module.exports = function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    res.status(200).json({
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
    });
};
