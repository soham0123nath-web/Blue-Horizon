/**
 * api/admin-data.js — Admin Dashboard API for Blue Horizon Overseas.
 * All endpoints require admin authentication.
 *
 * GET  ?action=dashboard   → Dashboard stats (total apps, pipeline, countries)
 * GET  ?action=admins      → List admin users
 * POST { action: 'addAdmin', email, full_name, role }
 * POST { action: 'removeAdmin', id }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin, SUPER_ADMIN_EMAIL } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();
    const user = await requireAdmin(req, res);
    if (!user) return;

    try {
        if (req.method === 'GET') {
            const url = new URL(req.url, `https://${req.headers.host}`);
            const action = url.searchParams.get('action') || 'dashboard';

            if (action === 'dashboard') {
                // Fetch all application status+country+created_at in ONE query
                const { data: allApps } = await supabase
                    .from('applications')
                    .select('status, country, created_at');

                const apps = allApps || [];
                const total = apps.length;

                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

                let thisWeek = 0, thisMonth = 0, deployed = 0;
                const byStatus = {};
                const byCountry = {};

                apps.forEach(a => {
                    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
                    byCountry[a.country] = (byCountry[a.country] || 0) + 1;
                    if (a.created_at >= weekAgo) thisWeek++;
                    if (a.created_at >= monthAgo) thisMonth++;
                    if (a.status === 'deployed') deployed++;
                });

                const conversionRate = total > 0 ? ((deployed / total) * 100).toFixed(1) : 0;

                // Counts for other entities (lightweight head-only queries)
                const [{ count: jobCount }, { count: testimonialCount }] = await Promise.all([
                    supabase.from('job_listings').select('*', { count: 'exact', head: true }),
                    supabase.from('video_testimonials').select('*', { count: 'exact', head: true })
                ]);

                return res.status(200).json({
                    total, thisWeek, thisMonth, conversionRate,
                    byStatus, byCountry,
                    jobCount: jobCount || 0,
                    testimonialCount: testimonialCount || 0,
                    adminEmail: user.email,
                    adminRole: user.adminRole
                });
            }

            if (action === 'admins') {
                if (!user.isSuperAdmin) {
                    return res.status(403).json({ error: 'Only super admins can manage admin users.' });
                }

                const { data, error } = await supabase
                    .from('bh_admins')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) return res.status(500).json({ error: 'Failed to fetch admins.' });
                return res.status(200).json({ admins: data || [] });
            }

            return res.status(400).json({ error: 'Invalid action.' });

        } else if (req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') body = JSON.parse(body);

            const { action } = body;

            if (action === 'addAdmin') {
                if (!user.isSuperAdmin) {
                    return res.status(403).json({ error: 'Only super admins can add admins.' });
                }

                const { email, full_name, role } = body;
                if (!email) return res.status(400).json({ error: 'Email required.' });

                const { data, error } = await supabase
                    .from('bh_admins')
                    .insert({
                        email: email.toLowerCase(),
                        full_name: full_name || null,
                        role: role || 'admin'
                    })
                    .select()
                    .single();

                if (error) {
                    if (error.code === '23505') return res.status(409).json({ error: 'Admin already exists.' });
                    return res.status(500).json({ error: 'Failed to add admin.' });
                }
                return res.status(201).json({ success: true, admin: data });
            }

            if (action === 'removeAdmin') {
                if (!user.isSuperAdmin) {
                    return res.status(403).json({ error: 'Only super admins can remove admins.' });
                }

                const { id } = body;
                if (!id) return res.status(400).json({ error: 'Admin ID required.' });

                const { error } = await supabase
                    .from('bh_admins')
                    .delete()
                    .eq('id', id);

                if (error) return res.status(500).json({ error: 'Failed to remove admin.' });
                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ error: 'Invalid action.' });

        } else {
            return res.status(405).json({ error: 'Method not allowed.' });
        }
    } catch (err) {
        console.error('Admin data API error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
