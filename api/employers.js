/**
 * api/employers.js — Employer Inquiry API for Blue Horizon Overseas.
 *
 * PUBLIC:
 *   POST /api/employers → Submit a new employer inquiry
 *
 * ADMIN:
 *   GET  /api/employers → List all employer inquiries
 *   POST /api/employers { action: 'update-status', id, status }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');
const { sendEmail }    = require('../lib/mailer');
const { employerInquiryAck } = require('../lib/email-templates');

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            // Admin only — list all inquiries
            const user = await requireAdmin(req, res);
            if (!user) return;

            const { data, error } = await supabase
                .from('employer_inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) return res.status(500).json({ error: 'Failed to fetch employer inquiries.' });
            return res.status(200).json({ inquiries: data || [] });

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
                    .from('employer_inquiries')
                    .update({ status })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) return res.status(500).json({ error: 'Failed to update status.' });
                return res.status(200).json({ success: true, inquiry: data });
            }

            // Public: submit new inquiry
            const { company_name, contact_person, email, phone, country, roles_needed, message } = body;

            if (!company_name || !contact_person || !phone) {
                return res.status(400).json({ error: 'Company name, contact person, and phone are required.' });
            }

            // Input validation
            if (company_name.length > 150) return res.status(400).json({ error: 'Company name is too long.' });
            if (contact_person.length > 100) return res.status(400).json({ error: 'Contact person name is too long.' });
            if (phone.length > 20) return res.status(400).json({ error: 'Phone number is too long.' });
            if (email && email.length > 100) return res.status(400).json({ error: 'Email is too long.' });
            if (roles_needed && roles_needed.length > 500) return res.status(400).json({ error: 'Roles description is too long.' });

            const { data, error } = await supabase
                .from('employer_inquiries')
                .insert({
                    company_name,
                    contact_person,
                    email: email || null,
                    phone,
                    country: country || null,
                    roles_needed: roles_needed || null,
                    message: message || null
                })
                .select()
                .single();

            if (error) return res.status(500).json({ error: 'Failed to submit inquiry.' });

            // Send acknowledgement email (fire-and-forget)
            if (email) {
                sendEmail({
                    to: email,
                    subject: `🤝 Inquiry Received — Blue Horizon Overseas`,
                    html: employerInquiryAck({ companyName: company_name, contactPerson: contact_person })
                });
            }

            return res.status(201).json({ success: true, inquiry: data });

        } else {
            return res.status(405).json({ error: 'Method not allowed.' });
        }
    } catch (err) {
        console.error('Employers API error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
