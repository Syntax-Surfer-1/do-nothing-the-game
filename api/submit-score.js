// /api/submit-score.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Only used in backend!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, name, score } = req.body;

  if (!id || !name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  // Prevent fake scores over 9999s (optional)
  if (score > 9999) {
    return res.status(400).json({ error: 'Score too high' });
  }

  try {
    const { data: existing } = await supabase
      .from('scores')
      .select('score')
      .eq('id', id)
      .single();

    if (!existing || score > existing.score) {
      const { error } = await supabase
        .from('scores')
        .upsert({ id, name, score });
      if (error) throw error;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
