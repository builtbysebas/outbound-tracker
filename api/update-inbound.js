const { getRows, updateRow } = require('./sheets-helper');

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
    const status = body.status || 'Contestó';
    const now = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });

    const rows = await getRows('Inbounds');
    let targetIndex = -1;
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][0] === usuario && rows[i][3] === 'Pendiente') {
        targetIndex = i + 1;
        break;
      }
    }

    if (targetIndex === -1) return res.status(404).json({ error: 'No pending inbound found' });

    const row = rows[targetIndex - 1];
    row[3] = status;
    row[4] = now;
    await updateRow('Inbounds', targetIndex, row);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
