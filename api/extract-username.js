module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = req.headers['x-anthropic-key'];
    
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing x-anthropic-key header' });
    }

    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });

    const base64 = Buffer.concat(chunks).toString('base64');

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: base64 }
            },
            {
              type: 'text',
              text: 'Esta es una captura de pantalla de un perfil de Instagram. El username aparece en la barra superior junto a la flecha de regreso. Responde ÚNICAMENTE con el @username. Nada más.'
            }
          ]
        }]
      })
    });

    const data = await anthropicRes.json();
    const username = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ username });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
