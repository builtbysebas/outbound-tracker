const { appendRow } = require('./sheets-helper');

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

    await appendRow('Llamadas', [usuario, fecha, hora, 'Propuesta', '', '', '']);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
