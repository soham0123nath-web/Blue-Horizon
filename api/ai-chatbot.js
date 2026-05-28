/**
 * api/ai-chatbot.js — Public AI Chatbot for Blue Horizon Overseas.
 * Answers candidate FAQs about visa, jobs, eligibility, and can check application status.
 *
 * POST /api/ai-chatbot { message, session_id }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');

const CHATBOT_PROMPT = `You are Aisha, the lead recruitment specialist for Blue Horizon Overseas — a friendly, highly empathetic human recruiter.
You are chatting with a candidate on our recruitment website. Your goal is to be incredibly warm, encouraging, and helpful.

Key facts about Blue Horizon Overseas:
- Licensed Government recruitment consultancy based in West Bengal, India.
- Places Indian workers in Israel (industrial/construction) and Vietnam (hospitality/food/corporate).
- Accepts ECR and ECNR passports. Freshers welcome.
- Process: Apply → CV Screening → Employer Selection → Visa & Docs → Deployment.
- WhatsApp is the main application channel: +91 89420 69079.

Current Live Jobs (Offer these if they ask what's available):
{DYNAMIC_JOBS}

Rules:
- Speak like a caring human recruiter (use "I", "we", "my team").
- Use emojis naturally but don't overdo it.
- Keep responses short, scannable, and under 150 words.
- If you can't answer, warmly suggest they contact the team on WhatsApp: +91 89420 69079.
- NEVER invent jobs or salaries. Only use the ones listed above.
- If they want to apply, enthusiastically tell them to click "Apply" on the job card, or contact us on WhatsApp.`;

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') body = JSON.parse(body);

        const { message, session_id } = body;
        if (!message) return res.status(400).json({ error: 'Message required.' });
        if (message.length > 500) return res.status(400).json({ error: 'Message is too long (max 500 chars).' });

        const sid = session_id || 'anonymous_' + Date.now();

        // Check for Groq key — use fallback responses if not available
        if (!process.env.GROQ_API_KEY) {
            const reply = getFallbackResponse(message);
            return res.status(200).json({ reply, session_id: sid });
        }

        const supabase = getSupabase();

        // Fetch live jobs dynamically and token-optimize them
        const { data: activeJobs } = await supabase
            .from('job_listings')
            .select('title, country, salary_display')
            .eq('is_active', true);

        let jobsString = `Currently Available Positions (Fallback):
- Iron Worker / Steel Fixer in Israel (Pays: $1,900 USD / ₹1.62 Lakhs)
- Shuttering Carpenter in Israel (Pays: $1,900 USD / ₹1.62 Lakhs)
- Ceramic Tiler in Israel (Pays: $1,900 USD / ₹1.62 Lakhs)
- Plasterer in Israel (Pays: $1,900 USD / ₹1.62 Lakhs)
- Food Packaging Worker in Vietnam (Pays: ₹35,000 INR)
- F&B Service Staff in Vietnam (Pays: ₹40,000 INR)
- Store Keeper / Helper in Vietnam (Pays: ₹30,000 INR)`;

        if (activeJobs && activeJobs.length > 0) {
            jobsString = activeJobs.map(j => `- ${j.title} in ${j.country} (Pays: ${j.salary_display})`).join('\n');
        }

        const finalPrompt = CHATBOT_PROMPT.replace('{DYNAMIC_JOBS}', jobsString);

        // Get recent chat history for context
        const { data: history } = await supabase
            .from('chat_logs')
            .select('role, message')
            .eq('session_id', sid)
            .order('created_at', { ascending: false })
            .limit(6);

        const messages = [
            { role: 'system', content: finalPrompt },
            ...((history || []).reverse().map(h => ({ role: h.role, content: h.message }))),
            { role: 'user', content: message }
        ];

        const OpenAI = require('openai');
        const openai = new OpenAI({ 
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });

        // Timeout: 10s max for AI response
        const controller = new AbortController();
        const aiTimeout = setTimeout(() => controller.abort(), 10000);

        const completion = await openai.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: messages,
            max_tokens: 200,
            temperature: 0.7
        }, { signal: controller.signal });

        clearTimeout(aiTimeout);
        const reply = completion.choices[0].message.content;

        // Log chat (fire-and-forget — don't block response)
        supabase.from('chat_logs').insert([
            { session_id: sid, role: 'user', message },
            { session_id: sid, role: 'assistant', message: reply }
        ]).then(() => {}).catch(logErr => console.error('Chat log error:', logErr));

        return res.status(200).json({ reply, session_id: sid });

    } catch (err) {
        console.error('Chatbot error:', err);
        return res.status(200).json({
            reply: "I'm having trouble connecting right now. Please contact us directly on WhatsApp: +91 89420 69079. We're happy to help! 😊"
        });
    }
};

// ── Keyword-based fallback when no OpenAI key ──
function getFallbackResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('salary') || msg.includes('pay') || msg.includes('earn')) {
        return "💰 Our Israel positions pay $1,000–$1,900 USD/month (₹85K–₹1.62L). Vietnam positions pay ₹30,000–₹65,000/month. Free accommodation and food are included! Check our Salary Calculator for detailed breakdowns.";
    }
    if (msg.includes('visa') || msg.includes('document') || msg.includes('passport')) {
        return "🛂 We handle the entire visa process for you! We accept both ECR and ECNR passports. You'll need: Passport, Photos, Educational certificates, and Work experience letters. Our team guides you through every step.";
    }
    if (msg.includes('apply') || msg.includes('how to') || msg.includes('job')) {
        return "📋 Applying is easy! Browse our job listings, click 'Apply', fill the short form, and it sends your details to our team via WhatsApp. You'll get a tracking ID to monitor your status. Apply now at our Jobs section!";
    }
    if (msg.includes('track') || msg.includes('status') || msg.includes('application')) {
        return "📍 You can track your application anytime! Go to our Tracker page, enter your Tracking ID and registered phone number, and see your real-time pipeline status.";
    }
    if (msg.includes('accommodation') || msg.includes('food') || msg.includes('living')) {
        return "🏠 Yes! Free accommodation and food are provided by employers for almost all our placements in both Israel and Vietnam. This means most of your salary can be saved!";
    }
    if (msg.includes('fresher') || msg.includes('experience') || msg.includes('eligibility')) {
        return "✅ Both freshers and experienced workers are welcome! We accept ECR and ECNR passports. Some roles require specific skills, but many positions are open to motivated freshers.";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "👋 Hello! Welcome to Blue Horizon Overseas. I'm here to help you explore overseas career opportunities in Israel and Vietnam. What would you like to know about?";
    }
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('whatsapp')) {
        return "📞 Contact us anytime!\n• WhatsApp: +91 89420 69079\n• Helpline: +91 92308 59550\n• Email: global@bluehorizonoverseas.in\n• Office: Sevoke Road, Salugara, Jalpaiguri";
    }

    return "Thanks for your question! For detailed assistance, please contact our recruitment team on WhatsApp: +91 89420 69079. They're available to help you with any queries about overseas jobs! 😊";
}
