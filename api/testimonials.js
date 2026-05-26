/**
 * api/testimonials.js — Video Testimonials API for Blue Horizon Overseas.
 *
 * PUBLIC:
 *   GET /api/testimonials                → Fetch active testimonials (cached 60s)
 *
 * ADMIN:
 *   POST /api/testimonials { action: 'create', ... }   → Add testimonial
 *   POST /api/testimonials { action: 'update', id, ... } → Update testimonial
 *   POST /api/testimonials { action: 'delete', id }    → Delete testimonial
 *   POST /api/testimonials { action: 'reorder', ids }  → Reorder testimonials
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            // Public: Fetch active testimonials
            res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

            const { data, error } = await supabase
                .from('video_testimonials')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                return res.status(500).json({ error: 'Failed to fetch testimonials.' });
            }

            return res.status(200).json({ testimonials: data || [] });

        } else if (req.method === 'POST') {
            const user = await requireAdmin(req, res);
            if (!user) return;

            let body = req.body;
            if (typeof body === 'string') body = JSON.parse(body);

            const { action } = body;

            if (action === 'create') {
                const { candidate_name, job_title, country, video_url, thumbnail_url, quote, rating } = body;

                if (!candidate_name || !job_title || !country || !video_url) {
                    return res.status(400).json({ error: 'Name, job title, country, and video URL are required.' });
                }

                const { data, error } = await supabase
                    .from('video_testimonials')
                    .insert({
                        candidate_name, job_title, country, video_url,
                        thumbnail_url: thumbnail_url || null,
                        quote: quote || null,
                        rating: rating || 5
                    })
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to create testimonial.' });
                return res.status(201).json({ success: true, testimonial: data });
            }

            if (action === 'update') {
                const { id, ...updates } = body;
                delete updates.action;

                if (!id) return res.status(400).json({ error: 'Testimonial ID required.' });

                const { data, error } = await supabase
                    .from('video_testimonials')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to update testimonial.' });
                return res.status(200).json({ success: true, testimonial: data });
            }

            if (action === 'delete') {
                const { id } = body;
                if (!id) return res.status(400).json({ error: 'Testimonial ID required.' });

                const { error } = await supabase
                    .from('video_testimonials')
                    .delete()
                    .eq('id', id);

                if (error) return res.status(500).json({ error: 'Failed to delete testimonial.' });
                return res.status(200).json({ success: true });
            }

            if (action === 'reorder') {
                const { ids } = body;
                if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Array of IDs required.' });

                const updates = ids.map((id, index) =>
                    supabase.from('video_testimonials').update({ display_order: index }).eq('id', id)
                );
                await Promise.all(updates);

                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ error: 'Invalid action.' });

        } else {
            return res.status(405).json({ error: 'Method not allowed.' });
        }
    } catch (err) {
        console.error('Testimonials API error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
