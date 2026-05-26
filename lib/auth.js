/**
 * lib/auth.js — JWT auth + admin RBAC helpers for Blue Horizon Overseas.
 *
 * requireAuth(req, res)  → returns Supabase user or null (sets 401 on failure)
 * requireAdmin(req, res) → returns Supabase user or null (sets 401/403 on failure)
 *
 * Usage:
 *   const { requireAdmin } = require('../lib/auth');
 *   const user = await requireAdmin(req, res);
 *   if (!user) return; // response already sent
 */

const { getSupabase } = require('./supabase');

const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase();

/**
 * Validates the Bearer JWT from Authorization header.
 * @returns {object|null} Supabase user, or null if unauthorized
 */
async function requireAuth(req, res) {
    const supabase = getSupabase();
    const authH = req.headers['authorization'];
    if (!authH?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser(authH.slice(7));
    if (error || !user) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    return user;
}

/**
 * Validates JWT and enforces admin RBAC (superadmin OR bh_admins table entry).
 * @returns {object|null} Supabase user, or null if forbidden
 */
async function requireAdmin(req, res) {
    const supabase = getSupabase();
    const user = await requireAuth(req, res);
    if (!user) return null;

    const isSuperAdmin = SUPER_ADMIN_EMAIL && user.email.toLowerCase() === SUPER_ADMIN_EMAIL;
    if (isSuperAdmin) {
        user.adminRole = 'superadmin';
        user.isSuperAdmin = true;
    } else {
        const { data: adminRecord, error } = await supabase
            .from('bh_admins')
            .select('role')
            .eq('email', user.email)
            .maybeSingle();
        if (error || !adminRecord) {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return null;
        }
        user.adminRole = adminRecord.role || 'admin';
        user.isSuperAdmin = false;
    }
    return user;
}

module.exports = { requireAuth, requireAdmin, SUPER_ADMIN_EMAIL };
