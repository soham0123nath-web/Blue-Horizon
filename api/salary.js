/**
 * api/salary.js — Salary Calculator API for Blue Horizon Overseas.
 *
 * PUBLIC:
 *   GET  /api/salary?action=getRoles             → Fetch all roles with salary config
 *   POST /api/salary { action: 'calculate', ... } → Calculate detailed breakdown
 *   POST /api/salary { action: 'aiAdvice', ... }  → AI savings advice (OpenAI)
 *
 * ADMIN:
 *   POST /api/salary { action: 'create', ... }   → Add salary config
 *   POST /api/salary { action: 'update', id, ... } → Update salary config
 *   POST /api/salary { action: 'delete', id }    → Delete salary config
 */

const { getSupabase } = require('../lib/supabase');
const { setCors }     = require('../lib/cors');
const { requireAdmin } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (setCors(req, res)) return res.status(200).end();

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            const url = new URL(req.url, `https://${req.headers.host}`);
            const action = url.searchParams.get('action') || 'getRoles';

            if (action === 'getRoles') {
                res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

                const { data, error } = await supabase
                    .from('salary_config')
                    .select('*')
                    .eq('is_active', true)
                    .order('country', { ascending: true })
                    .order('job_title', { ascending: true });

                if (error) return res.status(500).json({ error: 'Failed to fetch roles.' });
                return res.status(200).json({ roles: data || [] });
            }

            return res.status(400).json({ error: 'Invalid action.' });

        } else if (req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') body = JSON.parse(body);

            const { action } = body;

            if (action === 'calculate') {
                // Public: Calculate salary breakdown
                const { role_id, overtime_hours } = body;

                if (!role_id) return res.status(400).json({ error: 'Role ID required.' });

                const { data: role, error } = await supabase
                    .from('salary_config')
                    .select('*')
                    .eq('id', role_id)
                    .single();

                if (error || !role) return res.status(404).json({ error: 'Role not found.' });

                const ot = parseInt(overtime_hours) || 0;
                const overtimeEarnings = ot * (role.overtime_rate_per_hour || 0);
                const totalMonthlyUSD = parseFloat(role.base_salary_usd) + overtimeEarnings
                    + parseFloat(role.accommodation_value_usd || 0)
                    + parseFloat(role.food_value_usd || 0)
                    + parseFloat(role.medical_value_usd || 0);
                const totalMonthlyINR = totalMonthlyUSD * parseFloat(role.currency_rate || 85);
                const annualSavingsUSD = (totalMonthlyUSD - parseFloat(role.deductions_usd || 0)) * 12;
                const annualSavingsINR = annualSavingsUSD * parseFloat(role.currency_rate || 85);

                return res.status(200).json({
                    breakdown: {
                        job_title: role.job_title,
                        country: role.country,
                        base_salary_usd: parseFloat(role.base_salary_usd),
                        base_salary_inr: parseFloat(role.base_salary_usd) * parseFloat(role.currency_rate),
                        overtime_hours: ot,
                        overtime_earnings_usd: overtimeEarnings,
                        overtime_earnings_inr: overtimeEarnings * parseFloat(role.currency_rate),
                        accommodation_usd: parseFloat(role.accommodation_value_usd || 0),
                        food_usd: parseFloat(role.food_value_usd || 0),
                        medical_usd: parseFloat(role.medical_value_usd || 0),
                        total_monthly_usd: totalMonthlyUSD,
                        total_monthly_inr: totalMonthlyINR,
                        deductions_usd: parseFloat(role.deductions_usd || 0),
                        annual_savings_usd: annualSavingsUSD,
                        annual_savings_inr: annualSavingsINR,
                        currency_rate: parseFloat(role.currency_rate)
                    }
                });
            }

            if (action === 'aiAdvice') {
                // Public: AI savings advice
                const { role_id, overtime_hours, current_salary_inr, family_size } = body;

                if (!role_id) return res.status(400).json({ error: 'Role ID required.' });

                const { data: role, error } = await supabase
                    .from('salary_config')
                    .select('*')
                    .eq('id', role_id)
                    .single();

                if (error || !role) return res.status(404).json({ error: 'Role not found.' });

                // Check for OpenAI key
                if (!process.env.OPENAI_API_KEY) {
                    return res.status(200).json({
                        advice: `Based on the ${role.job_title} role in ${role.country}, you can expect to earn approximately $${role.base_salary_usd}/month (₹${Math.round(role.base_salary_usd * role.currency_rate).toLocaleString()}) with free accommodation and food. This means most of your salary can be saved and sent home. Over a year, your total savings potential is significant compared to typical Indian salaries. We recommend applying as soon as possible — these positions fill quickly!`
                    });
                }

                const OpenAI = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                const ot = parseInt(overtime_hours) || 0;
                const totalMonthly = parseFloat(role.base_salary_usd) + ot * (role.overtime_rate_per_hour || 0);
                const totalINR = Math.round(totalMonthly * role.currency_rate);

                const prompt = `You are a helpful financial advisor for Blue Horizon Overseas, a recruitment consultancy placing Indian workers abroad. 

A candidate is considering the "${role.job_title}" role in ${role.country}.
- Monthly salary: $${totalMonthly} USD (₹${totalINR.toLocaleString()} INR)
- Free accommodation and food provided by employer
- ${ot > 0 ? `Planning ${ot} overtime hours/month` : 'No overtime planned'}
${current_salary_inr ? `- Current salary in India: ₹${parseInt(current_salary_inr).toLocaleString()}/month` : ''}
${family_size ? `- Family size: ${family_size} members` : ''}

Provide a short, encouraging, personalized savings advice in 3-4 bullet points. Include:
1. Estimated monthly savings (since food & accommodation are free)
2. Annual savings potential in INR
3. What they could do with savings (house, education, investments)
4. A motivational note about career growth

Keep it warm, professional, and under 200 words. Use ₹ for INR amounts.`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300,
                    temperature: 0.7
                });

                return res.status(200).json({
                    advice: completion.choices[0].message.content
                });
            }

            // Admin actions
            if (action === 'create' || action === 'update' || action === 'delete') {
                const user = await requireAdmin(req, res);
                if (!user) return;

                if (action === 'create') {
                    const { job_title, country, base_salary_usd, overtime_rate_per_hour,
                        typical_overtime_hours, accommodation_value_usd, food_value_usd,
                        medical_value_usd, deductions_usd, currency_rate } = body;

                    if (!job_title || !country || !base_salary_usd) {
                        return res.status(400).json({ error: 'Job title, country, and base salary required.' });
                    }

                    const { data, error } = await supabase
                        .from('salary_config')
                        .insert({
                            job_title, country,
                            base_salary_usd: parseFloat(base_salary_usd),
                            overtime_rate_per_hour: parseFloat(overtime_rate_per_hour || 0),
                            typical_overtime_hours: parseInt(typical_overtime_hours || 0),
                            accommodation_value_usd: parseFloat(accommodation_value_usd || 0),
                            food_value_usd: parseFloat(food_value_usd || 0),
                            medical_value_usd: parseFloat(medical_value_usd || 0),
                            deductions_usd: parseFloat(deductions_usd || 0),
                            currency_rate: parseFloat(currency_rate || 85)
                        })
                        .select()
                        .single();

                    if (error) return res.status(500).json({ error: 'Failed to create salary config.' });
                    return res.status(201).json({ success: true, config: data });
                }

                if (action === 'update') {
                    const { id, ...updates } = body;
                    delete updates.action;
                    if (!id) return res.status(400).json({ error: 'Config ID required.' });

                    updates.updated_at = new Date().toISOString();
                    const { data, error } = await supabase
                        .from('salary_config')
                        .update(updates)
                        .eq('id', id)
                        .select()
                        .single();

                    if (error) return res.status(500).json({ error: 'Failed to update salary config.' });
                    return res.status(200).json({ success: true, config: data });
                }

                if (action === 'delete') {
                    const { id } = body;
                    if (!id) return res.status(400).json({ error: 'Config ID required.' });

                    const { error } = await supabase
                        .from('salary_config')
                        .delete()
                        .eq('id', id);

                    if (error) return res.status(500).json({ error: 'Failed to delete salary config.' });
                    return res.status(200).json({ success: true });
                }
            }

            return res.status(400).json({ error: 'Invalid action.' });

        } else {
            return res.status(405).json({ error: 'Method not allowed.' });
        }
    } catch (err) {
        console.error('Salary API error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
