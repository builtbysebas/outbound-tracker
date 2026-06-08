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
              text: 'Lee la barra superior de navegación de este perfil de Instagram. El username está en letras pequeñas junto a la flecha "<" de regreso. COPIA ESE TEXTO EXACTAMENTE, caracter por caracter, sin corregir ni cambiar NADA. Si hay letras repetidas como "nn", "ll", "rr", cópialas exactamente. Responde SOLO con @username.'
            }
          ]
        }]
      })
    });

    const data = await anthropicRes.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    const username = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ username });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
