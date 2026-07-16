const { getRows, updateRow } = require('./sheets-helper');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });

    const body = JSON.parse(Buffer.concat(chunks).toString());
    const { rowIndex, status } = body;
    const now = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });

    if (!rowIndex || !status) {
      return res.status(400).json({ error: 'Missing rowIndex or status', body });
    }

    const rows = await getRows('Leads');
    if (!rows[rowIndex - 1]) {
      return res.status(404).json({ error: 'Row not found', rowIndex, totalRows: rows.length });
    }

    const row = [...rows[rowIndex - 1]];
    // Ensure row has enough columns
    while (row.length < 5) row.push('');
    row[3] = status;
    if (status !== 'Pendiente') row[4] = now;
    
    await updateRow('Leads', rowIndex, row);
    return res.status(200).json({ ok: true, rowIndex, status });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
