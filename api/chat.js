// ===== RATE LIMITING SIMPLE =====
const rateLimitMap = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting par IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const maintenant = Date.now();
  const limite = 10;
  const fenetre = 60 * 1000;

  const historique = rateLimitMap.get(ip) || [];
  const recentes = historique.filter(t => maintenant - t < fenetre);

  if (recentes.length >= limite) {
    return res.status(429).json({ error: 'Trop de messages, attends une minute !' });
  }

  recentes.push(maintenant);
  rateLimitMap.set(ip, recentes);

  // Validation
  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length > 50) {
    return res.status(400).json({ error: 'Messages invalides' });
  }

  if (!systemPrompt || typeof systemPrompt !== 'string') {
    return res.status(400).json({ error: 'System prompt invalide' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Groq :', data);
      return res.status(response.status).json({ error: 'Erreur du service IA, réessaie dans un instant.' });
    }

    return res.status(200).json(data);

  } catch (erreur) {
    console.error('Erreur Groq :', erreur);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}