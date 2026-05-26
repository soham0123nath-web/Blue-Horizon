/**
 * api/jobs.js — Dynamic Job Listings API for Blue Horizon Overseas.
 *
 * PUBLIC:
 *   GET /api/jobs → Fetch active jobs grouped by country/division (cached 60s)
 *
 * ADMIN:
 *   POST /api/jobs { action: 'create', ... }
 *   POST /api/jobs { action: 'update', id, ... }
 *   POST /api/jobs { action: 'delete', id }
 *   POST /api/jobs { action: 'toggle', id }         → Toggle active/inactive
 *   POST /api/jobs { action: 'reorder', ids }       → Reorder jobs
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

            const { data, error } = await supabase
                .from('job_listings')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) return res.status(500).json({ error: 'Failed to fetch jobs.' });

            // Group by country → division
            const grouped = {};
            (data || []).forEach(job => {
                if (!grouped[job.country]) grouped[job.country] = {};
                if (!grouped[job.country][job.division]) grouped[job.country][job.division] = [];
                grouped[job.country][job.division].push(job);
            });

            return res.status(200).json({ jobs: data || [], grouped });

        } else if (req.method === 'POST') {
            const user = await requireAdmin(req, res);
            if (!user) return;

            let body = req.body;
            if (typeof body === 'string') body = JSON.parse(body);

            const { action } = body;

            if (action === 'create') {
                const { title, emoji, country, division, salary_display, salary_inr_display, details, is_urgent, spots_remaining } = body;

                if (!title || !country || !division || !salary_display) {
                    return res.status(400).json({ error: 'Title, country, division, and salary display required.' });
                }

                const { data, error } = await supabase
                    .from('job_listings')
                    .insert({
                        title, emoji: emoji || '🏭', country, division,
                        salary_display, salary_inr_display: salary_inr_display || null,
                        details: details || [], is_urgent: is_urgent || false,
                        spots_remaining: spots_remaining || null
                    })
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to create job.' });
                return res.status(201).json({ success: true, job: data });
            }

            if (action === 'update') {
                const { id, ...updates } = body;
                delete updates.action;
                if (!id) return res.status(400).json({ error: 'Job ID required.' });

                updates.updated_at = new Date().toISOString();
                const { data, error } = await supabase
                    .from('job_listings')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to update job.' });
                return res.status(200).json({ success: true, job: data });
            }

            if (action === 'delete') {
                const { id } = body;
                if (!id) return res.status(400).json({ error: 'Job ID required.' });

                const { error } = await supabase
                    .from('job_listings')
                    .delete()
                    .eq('id', id);

                if (error) return res.status(500).json({ error: 'Failed to delete job.' });
                return res.status(200).json({ success: true });
            }

            if (action === 'toggle') {
                const { id } = body;
                if (!id) return res.status(400).json({ error: 'Job ID required.' });

                const { data: job } = await supabase
                    .from('job_listings')
                    .select('is_active')
                    .eq('id', id)
                    .single();

                if (!job) return res.status(404).json({ error: 'Job not found.' });

                const { data, error } = await supabase
                    .from('job_listings')
                    .update({ is_active: !job.is_active, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to toggle job.' });
                return res.status(200).json({ success: true, job: data });
            }

            if (action === 'reorder') {
                const { ids } = body;
                if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Array of IDs required.' });

                const updates = ids.map((id, index) =>
                    supabase.from('job_listings').update({ display_order: index }).eq('id', id)
                );
                await Promise.all(updates);

                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ error: 'Invalid action.' });

        } else {
            return res.status(405).json({ error: 'Method not allowed.' });
        }
    } catch (err) {
        console.error('Jobs API error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
