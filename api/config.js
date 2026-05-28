const { setCors } = require('../lib/cors');

module.exports = function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    // These values are stable across deploys — cache aggressively
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    res.status(200).json({
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
    });
};
