const { getRows } = require('./sheets-helper');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [leads, fups, inbounds, llamadas] = await Promise.all([
      getRows('Leads'),
      getRows('Follow-ups'),
      getRows('Inbounds'),
      getRows('Llamadas')
    ]);

    const parseLeads = leads.slice(1).map((r, i) => ({
      rowIndex: i + 2,
      username: r[0]||'', fecha: r[1]||'', hora: r[2]||'',
      status: r[3]||'Pendiente', fechaResp: r[4]||''
    }));

    const parseFups = fups.slice(1).map((r, i) => ({
      rowIndex: i + 2,
      username: r[0]||'', fecha: r[1]||'', hora: r[2]||'', tipo: r[3]||'Manual'
    }));

    const parseInbounds = inbounds.slice(1).map((r, i) => ({
      rowIndex: i + 2,
      username: r[0]||'', fecha: r[1]||'', hora: r[2]||'',
      status: r[3]||'Pendiente', fechaResp: r[4]||''
    }));

    const parseLlamadas = llamadas.slice(1).map((r, i) => ({
      rowIndex: i + 2,
      username: r[0]||'', fecha: r[1]||'', hora: r[2]||'',
      status: r[3]||'Propuesta', calificacion: r[4]||'', fechaCal: r[5]||''
    }));

    return res.status(200).json({ leads: parseLeads, fups: parseFups, inbounds: parseInbounds, llamadas: parseLlamadas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
