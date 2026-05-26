/**
 * api/ai-chatbot.js — Public AI Chatbot for Blue Horizon Overseas.
 * Answers candidate FAQs about visa, jobs, eligibility, and can check application status.
 *
 * POST /api/ai-chatbot { message, session_id }
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');

const CHATBOT_PROMPT = `You are the Blue Horizon Overseas AI Assistant — a friendly, helpful chatbot on the recruitment website. You help candidates with:

1. Job information (Israel and Vietnam placements)
2. Visa and documentation process
3. Eligibility requirements
4. Salary and benefits details
5. Application tracking (if they provide a tracking ID)

Key facts about Blue Horizon Overseas:
- Licensed Government recruitment consultancy based in West Bengal, India
- Places Indian workers in Israel (industrial/construction) and Vietnam (hospitality/food/corporate)
- Israel: $1000-$1900 USD/month, free accommodation & food, overtime available
- Vietnam: ₹30,000-₹65,000/month, free accommodation & food
- Accepts ECR and ECNR passports
- Freshers welcome for most positions
- Process: Apply → CV Screening → Employer Selection → Visa & Docs → Deployment
- WhatsApp is the main application channel: +91 89420 69079
- Office: Divya Kunj, Opp Northern Flour Mill, Sevoke Road, Salugara, Jalpaiguri-734008
- Email: global@bluehorizonoverseas.in

Rules:
- Be warm, encouraging, and professional
- Keep responses under 150 words
- Use simple English (many candidates are not fluent English speakers)
- If you can't answer, say "For more details, please contact us on WhatsApp: +91 89420 69079"
- Never make up job listings or salary figures
- Don't discuss competitor agencies`;

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

        const sid = session_id || 'anonymous_' + Date.now();

        // Check for Groq key — use fallback responses if not available
        if (!process.env.GROQ_API_KEY) {
            const reply = getFallbackResponse(message);
            return res.status(200).json({ reply, session_id: sid });
        }

        const supabase = getSupabase();

        // Get recent chat history for context
        const { data: history } = await supabase
            .from('chat_logs')
            .select('role, message')
            .eq('session_id', sid)
            .order('created_at', { ascending: false })
            .limit(6);

        const messages = [
            { role: 'system', content: CHATBOT_PROMPT },
            ...((history || []).reverse().map(h => ({ role: h.role, content: h.message }))),
            { role: 'user', content: message }
        ];

        const OpenAI = require('openai');
        const openai = new OpenAI({ 
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });

        const completion = await openai.chat.completions.create({
            model: 'llama3-8b-8192',
            messages,
            max_tokens: 200,
            temperature: 0.7
        });

        const reply = completion.choices[0].message.content;

        // Log chat
        await supabase.from('chat_logs').insert([
            { session_id: sid, role: 'user', message },
            { session_id: sid, role: 'assistant', message: reply }
        ]);

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
