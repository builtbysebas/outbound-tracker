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
    const calificacion = body.calificacion; // "Calificada", "Descalificada", "Pendiente"

    if (!calificacion) return res.status(400).json({ error: 'Missing calificacion' });

    const now = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });

    // Find most recent Agendada record for this user
    const search = await fetch(
      `https://api.airtable.com/v0/appiyrgAQxpLTDP36/tbl4HjdJL8RTc1X77?filterByFormula=AND({Usuario}="${usuario}",{Status}="Agendada")&sort[0][field]=Fecha&sort[0][direction]=desc&maxRecords=1`,
      { headers: { Authorization: 'Bearer patHkf1FRT9N5mLx9.789bd4f8be94e6d2566c3fde5f4497de4b789eb602e3e3340d8ca57c929c8f34' } }
    );

    const searchData = await search.json();
    const record = searchData.records?.[0];
    if (!record) return res.status(404).json({ error: 'No agendada record found for ' + usuario });

    await fetch(
      `https://api.airtable.com/v0/appiyrgAQxpLTDP36/tbl4HjdJL8RTc1X77/${record.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer patHkf1FRT9N5mLx9.789bd4f8be94e6d2566c3fde5f4497de4b789eb602e3e3340d8ca57c929c8f34',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: { Calificacion: calificacion, 'Fecha Calificacion': now } })
      }
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
