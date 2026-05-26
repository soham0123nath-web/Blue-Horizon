/**
 * api/admin-chat.js — AI Recruitment Assistant for Blue Horizon Overseas.
 * Admin-only endpoint. Streams AI responses for recruitment queries.
 *
 * POST /api/admin-chat { message, history }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');

const SYSTEM_PROMPT = `You are the AI Recruitment Assistant for Blue Horizon Overseas, a licensed Indian manpower consultancy placing workers in Israel and Vietnam.

Your capabilities:
- Answer questions about recruitment data, applications, and pipeline status
- Help draft WhatsApp messages for candidates
- Provide insights on recruitment metrics
- Suggest improvements to the hiring process

Context about Blue Horizon Overseas:
- Licensed Government recruitment consultancy
- Places workers in Israel (industrial/construction roles) and Vietnam (hospitality/corporate roles)
- Israel roles pay $1000-$1900 USD/month with free accommodation and food
- Vietnam roles pay ₹30,000-₹65,000/month with free accommodation and food
- Application pipeline: Applied → Screening → Shortlisted → Interview → Selected → Documentation → Visa Processing → Medical Clearance → Ticket Booked → Deployed
- WhatsApp is the primary communication channel
- Accepts both ECR and ECNR passport holders

Be concise, professional, and helpful. Use emojis sparingly. Format responses with bullet points when listing data.`;

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const user = await requireAdmin(req, res);
    if (!user) return;

    try {
        let body = req.body;
        if (typeof body === 'string') body = JSON.parse(body);

        const { message, history } = body;
        if (!message) return res.status(400).json({ error: 'Message required.' });

        // Check for Groq key
        if (!process.env.GROQ_API_KEY) {
            return res.status(200).json({
                reply: "AI assistant is not configured. Please add your GROQ_API_KEY environment variable to enable AI features.\n\nIn the meantime, you can manage applications, jobs, and testimonials using the dashboard tabs above."
            });
        }

        const supabase = getSupabase();

        // Fetch recent data context for AI
        const { data: recentApps } = await supabase
            .from('applications')
            .select('tracking_id, full_name, job_title, country, status, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        const { data: stats } = await supabase
            .from('applications')
            .select('status, country');

        const total = stats?.length || 0;
        const byStatus = {};
        const byCountry = {};
        (stats || []).forEach(a => {
            byStatus[a.status] = (byStatus[a.status] || 0) + 1;
            byCountry[a.country] = (byCountry[a.country] || 0) + 1;
        });

        const dataContext = `
Current data snapshot:
- Total applications: ${total}
- By status: ${JSON.stringify(byStatus)}
- By country: ${JSON.stringify(byCountry)}
- Recent 10 applications: ${JSON.stringify(recentApps?.map(a => `${a.full_name} - ${a.job_title} (${a.country}) - ${a.status}`) || [])}
`;

        const OpenAI = require('openai');
        const openai = new OpenAI({ 
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + '\n\n' + dataContext },
            ...(history || []).slice(-10),
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: 'llama3-70b-8192',
            messages,
            max_tokens: 500,
            temperature: 0.7
        });

        const reply = completion.choices[0].message.content;

        // Log chat
        await supabase.from('chat_logs').insert([
            { session_id: user.email, role: 'user', message },
            { session_id: user.email, role: 'assistant', message: reply }
        ]);

        return res.status(200).json({ reply });

    } catch (err) {
        console.error('Admin chat error:', err);
        return res.status(500).json({ error: 'AI assistant error. Please try again.' });
    }
};
