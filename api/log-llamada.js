module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });

    const body = JSON.parse(Buffer.concat(chunks).toString());
    let usuario = body.usuario || body.username || '';
    if (usuario && !usuario.startsWith('@')) usuario = '@' + usuario;

    const now = new Date().toLocaleString('en-CA', { timeZone: 'America/Costa_Rica', hour12: false });
    const [fecha, horaRaw] = now.split(', ');
    const hora = horaRaw.substring(0, 5);

    const r = await fetch('https://api.airtable.com/v0/appiyrgAQxpLTDP36/tbl4HjdJL8RTc1X77', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer patHkf1FRT9N5mLx9.789bd4f8be94e6d2566c3fde5f4497de4b789eb602e3e3340d8ca57c929c8f34',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields: { Usuario: usuario, Fecha: fecha, Hora: hora, Status: 'Propuesta' } }]
      })
    });

    const data = await r.json();
    return res.status(200).json({ ok: true, recordId: data.records?.[0]?.id || '' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
