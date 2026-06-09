module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });

    const { recordId, status } = JSON.parse(Buffer.concat(chunks).toString());

    const now = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });

    const fields = { Status: status };
    if (status === 'Contestó' || status === 'Follow-up') {
      fields['Fecha Respuesta'] = now;
    }

    const r = await fetch(
      `https://api.airtable.com/v0/appiyrgAQxpLTDP36/tbl9s489yXa9fHA8h/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer patHkf1FRT9N5mLx9.789bd4f8be94e6d2566c3fde5f4497de4b789eb602e3e3340d8ca57c929c8f34',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    const data = await r.json();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
