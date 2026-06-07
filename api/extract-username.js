export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': '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',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Esta es una captura de pantalla de un perfil de Instagram. El username aparece en la barra superior de la pantalla, en letras pequeñas junto a la flecha de regreso. Es el identificador único del perfil, siempre en minúsculas, sin espacios, sin emojis. IGNORA el nombre completo, la bio, los @menciones en la descripción, y cualquier otro texto. Responde ÚNICAMENTE con el @username exacto tal como aparece en la barra superior. Nada más.',
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const username = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ username });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
