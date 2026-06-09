module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });

    const body = JSON.parse(Buffer.concat(chunks).toString());
    const usuario = body.usuario || body.username || '';
    const tipo = body.tipo || 'Automático';

    const now = new Date().toLocaleString('en-CA', {
      timeZone: 'America/Costa_Rica',
      hour12: false,
    });

    const [fecha, horaRaw] = now.split(', ');
    const hora = horaRaw.substring(0, 5);

    const airtableRes = await fetch(
      'https://api.airtable.com/v0/appiyrgAQxpLTDP36/tblDNB4KHlcOlFL7t',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer patHkf1FRT9N5mLx9.789bd4f8be94e6d2566c3fde5f4497de4b789eb602e3e3340d8ca57c929c8f34',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              Usuario: usuario,
              Fecha: fecha,
              Hora: hora,
              Tipo: tipo,
            },
          }],
        }),
      }
    );

    const data = await airtableRes.json();
    return res.status(200).json({ ok: true, record: data.records?.[0]?.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
