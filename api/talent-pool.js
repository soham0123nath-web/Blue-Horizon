/**
 * api/talent-pool.js — Talent Pool API for Blue Horizon Overseas.
 *
 * PUBLIC:
 *   POST /api/talent-pool → Submit CV / join talent pool
 *
 * ADMIN:
 *   GET  /api/talent-pool → List all talent pool entries
 *   POST /api/talent-pool { action: 'update-status', id, status }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');
const { sendEmail }    = require('../lib/mailer');
const { talentPoolAck } = require('../lib/email-templates');

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            // Admin only — list all entries
            const user = await requireAdmin(req, res);
            if (!user) return;

            const { data, error } = await supabase
                .from('talent_pool')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) return res.status(500).json({ error: 'Failed to fetch talent pool.' });
            return res.status(200).json({ entries: data || [] });

        } else if (req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') body = JSON.parse(body);

            // Admin action: update status
            if (body.action === 'update-status') {
                const user = await requireAdmin(req, res);
                if (!user) return;

                const { id, status } = body;
                if (!id || !status) return res.status(400).json({ error: 'ID and status required.' });

                const { data, error } = await supabase
                    .from('talent_pool')
                    .update({ status })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to update status.' });
                return res.status(200).json({ success: true, entry: data });
            }

            // Public: submit new talent pool entry
            const { full_name, phone, email, trade, experience, preferred_country } = body;

            if (!full_name || !phone || !trade) {
                return res.status(400).json({ error: 'Full name, phone, and trade are required.' });
            }

            const { data, error } = await supabase
                .from('talent_pool')
                .insert({
                    full_name,
                    phone,
                    email: email || null,
                    trade,
                    experience: experience || null,
                    preferred_country: preferred_country || null
                })
                .select()
                .single();

            if (error) return res.status(500).json({ error: 'Failed to submit to talent pool.' });

            // Send acknowledgement email (fire-and-forget)
            if (email) {
                sendEmail({
                    to: email,
                    subject: `📋 You're in Our Talent Pool! — Blue Horizon Overseas`,
                    html: talentPoolAck({ name: full_name, trade })
                });
            }

            return res.status(201).json({ success: true, entry: data });

        } else {
            return res.status(405).json({ error: 'Method not allowed.' });
        }
    } catch (err) {
        console.error('Talent Pool API error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
