/**
 * api/applications.js — Application Tracker API for Blue Horizon Overseas.
 *
 * PUBLIC endpoints:
 *   POST   /api/applications                          → Submit new application
 *   GET    /api/applications?action=track&id=X&phone=Y → Track application status
 *
 * ADMIN endpoints (require auth):
 *   GET    /api/applications?action=list&status=X&country=X&page=1  → List applications
 *   POST   /api/applications  { action: 'updateStatus', id, status, notes }
 *   POST   /api/applications  { action: 'addNote', id, notes }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');

// ── Tracking ID Generator ──
function generateTrackingId() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return `BH-${y}${m}${d}-${code}`;
}

// ── Valid status transitions (state machine) ──
const STATUS_ORDER = [
    'applied', 'screening', 'shortlisted', 'interview',
    'selected', 'documentation', 'visa_processing',
    'medical_clearance', 'ticket_booked', 'deployed'
];

const STATUS_TIMESTAMPS = {
    applied: 'applied_at',
    screening: 'screened_at',
    shortlisted: 'shortlisted_at',
    interview: 'interview_at',
    selected: 'selected_at',
    documentation: 'documentation_at',
    visa_processing: 'visa_at',
    medical_clearance: 'medical_at',
    ticket_booked: 'ticket_at',
    deployed: 'deployed_at',
    rejected: 'rejected_at'
};

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            return await handleGet(req, res, supabase);
        } else if (req.method === 'POST') {
            return await handlePost(req, res, supabase);
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ══════════════════════════════════════
// GET handlers
// ══════════════════════════════════════
async function handleGet(req, res, supabase) {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action') || 'track';

    if (action === 'track') {
        // Public: Track application by ID + phone
        const id = url.searchParams.get('id');
        const phone = url.searchParams.get('phone');

        if (!id || !phone) {
            return res.status(400).json({ error: 'Tracking ID and phone number are required.' });
        }

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('tracking_id', id.toUpperCase())
            .eq('phone', phone.replace(/\s/g, ''))
            .maybeSingle();

        if (error || !data) {
            return res.status(404).json({ error: 'Application not found. Please verify your tracking ID and phone number.' });
        }

        // Build timeline
        const timeline = [];
        STATUS_ORDER.forEach(status => {
            const tsKey = STATUS_TIMESTAMPS[status];
            if (data[tsKey]) {
                timeline.push({ status, date: data[tsKey] });
            }
        });
        if (data.rejected_at) {
            timeline.push({ status: 'rejected', date: data.rejected_at });
        }

        // Generate next steps message
        const nextSteps = getNextSteps(data.status);

        return res.status(200).json({
            tracking_id: data.tracking_id,
            full_name: data.full_name,
            job_title: data.job_title,
            country: data.country,
            status: data.status,
            current_stage: STATUS_ORDER.indexOf(data.status) + 1,
            total_stages: STATUS_ORDER.length,
            timeline,
            next_steps: nextSteps,
            applied_at: data.applied_at
        });
    }

    if (action === 'list') {
        // Admin: List applications with filters
        const user = await requireAdmin(req, res);
        if (!user) return;

        const status = url.searchParams.get('status');
        const country = url.searchParams.get('country');
        const search = url.searchParams.get('search');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('applications')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);
        if (country) query = query.eq('country', country);
        if (search) query = query.or(`full_name.ilike.%${search}%,tracking_id.ilike.%${search}%,phone.ilike.%${search}%,job_title.ilike.%${search}%`);

        const { data, error, count } = await query;

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch applications.' });
        }

        return res.status(200).json({
            applications: data,
            total: count,
            page,
            pages: Math.ceil(count / limit)
        });
    }

    if (action === 'stats') {
        // Admin: Dashboard statistics
        const user = await requireAdmin(req, res);
        if (!user) return;

        const { data: all, error } = await supabase
            .from('applications')
            .select('status, country, created_at');

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch stats.' });
        }

        const total = all.length;
        const byStatus = {};
        const byCountry = {};
        STATUS_ORDER.concat(['rejected']).forEach(s => { byStatus[s] = 0; });

        all.forEach(app => {
            byStatus[app.status] = (byStatus[app.status] || 0) + 1;
            byCountry[app.country] = (byCountry[app.country] || 0) + 1;
        });

        const deployed = byStatus['deployed'] || 0;
        const conversionRate = total > 0 ? ((deployed / total) * 100).toFixed(1) : 0;

        // This week count
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thisWeek = all.filter(a => a.created_at >= weekAgo).length;

        return res.status(200).json({
            total, thisWeek, conversionRate,
            byStatus, byCountry
        });
    }

    return res.status(400).json({ error: 'Invalid action.' });
}

// ══════════════════════════════════════
// POST handlers
// ══════════════════════════════════════
async function handlePost(req, res, supabase) {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const action = body.action || 'submit';

    if (action === 'submit') {
        // Public: Submit new application
        const { full_name, phone, email, job_title, country, division, experience, cover_note, passport_type } = body;

        if (!full_name || !phone || !job_title || !country) {
            return res.status(400).json({ error: 'Full name, phone, job title, and country are required.' });
        }

        // Generate unique tracking ID (retry on collision)
        let tracking_id;
        let attempts = 0;
        while (attempts < 5) {
            tracking_id = generateTrackingId();
            const { data: existing } = await supabase
                .from('applications')
                .select('id')
                .eq('tracking_id', tracking_id)
                .maybeSingle();
            if (!existing) break;
            attempts++;
        }

        const { data, error } = await supabase
            .from('applications')
            .insert({
                tracking_id,
                full_name: full_name.trim(),
                phone: phone.replace(/\s/g, ''),
                email: email?.trim() || null,
                job_title,
                country,
                division: division || null,
                experience: experience || null,
                cover_note: cover_note || null,
                passport_type: passport_type || null,
                status: 'applied',
                applied_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Insert error:', error);
            return res.status(500).json({ error: 'Failed to submit application.' });
        }

        return res.status(201).json({
            success: true,
            tracking_id,
            message: `Application submitted! Your tracking ID is ${tracking_id}. Save this to check your status anytime.`
        });
    }

    if (action === 'updateStatus') {
        // Admin: Update application status
        const user = await requireAdmin(req, res);
        if (!user) return;

        const { id, status, notes } = body;
        if (!id || !status) {
            return res.status(400).json({ error: 'Application ID and new status required.' });
        }

        // Validate status
        const validStatuses = [...STATUS_ORDER, 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Valid: ${validStatuses.join(', ')}` });
        }

        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        // Set the timestamp for this status
        const tsKey = STATUS_TIMESTAMPS[status];
        if (tsKey) {
            updateData[tsKey] = new Date().toISOString();
        }

        if (notes) {
            updateData.admin_notes = notes;
        }

        const { data, error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update status.' });
        }

        return res.status(200).json({ success: true, application: data });
    }

    if (action === 'addNote') {
        // Admin: Add admin notes
        const user = await requireAdmin(req, res);
        if (!user) return;

        const { id, notes } = body;
        if (!id || !notes) {
            return res.status(400).json({ error: 'Application ID and notes required.' });
        }

        const { data, error } = await supabase
            .from('applications')
            .update({ admin_notes: notes, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to add notes.' });
        }

        return res.status(200).json({ success: true, application: data });
    }

    return res.status(400).json({ error: 'Invalid action.' });
}

// ══════════════════════════════════════
// Next Steps Generator
// ══════════════════════════════════════
function getNextSteps(status) {
    const steps = {
        applied: 'Your application has been received! Our recruitment team will review your profile within 2-3 business days. Keep your phone accessible for our call.',
        screening: 'Your profile is being reviewed by our screening team. We are matching your skills with available positions. Expect an update within 3-5 days.',
        shortlisted: 'Great news! You have been shortlisted. Our team will contact you to schedule an interview with the employer. Please keep your documents ready.',
        interview: 'Your interview has been scheduled. Prepare your original documents, certificates, and passport. Our team will share the interview details via WhatsApp.',
        selected: 'Congratulations! You have been selected by the employer. We will now begin the documentation process. Please gather your passport, photos, and certificates.',
        documentation: 'Your documents are being processed. This includes employment contract preparation and verification. Expected timeline: 1-2 weeks.',
        visa_processing: 'Your visa application has been submitted. Processing times vary by country. We will notify you as soon as your visa is approved.',
        medical_clearance: 'Please complete your medical examination at the designated hospital. We will share the location and appointment details via WhatsApp.',
        ticket_booked: 'Your flight has been booked! We will share your ticket details and pre-departure briefing schedule. Start preparing for your journey!',
        deployed: 'You have been successfully deployed! Welcome to your new workplace. Contact us anytime if you need support.',
        rejected: 'Unfortunately, your application was not selected this time. Please feel free to apply for other positions or contact us for feedback.'
    };
    return steps[status] || 'Status update pending. Please contact our team for more information.';
}
