const SHEET_ID = '1Tsoa5otBQ2b7idtdIU_DXpwLQmLQfeiEZOmp_E0PNCU';

const CREDENTIALS = {
  client_email: 'outbound-tracker@outbound-tracker-502601.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDQvA1MR3PuFkzw\nRHhOEokNrnyBFm0R8jNJWqBDyT/WRQxn7Y6kSh9hHjmBVAcfr8SstUj7PpbLvVh0\naTNSZ687SWaC9kBYF6/hi+QsN7401P4TnHLlhTo3imiJ8MdCusOb8qjuFAv9jnQe\nd2vDLslk13m4WtH0lbRKBadB3foxpDXzFAXprWfszDNUtiUPVS2wbM7zlK2hG782\nFtL3A39X8V4ZISrJQSW3uwIZQddLA6dwW9XQHQuRXuNuPw4opaKbfW1GCe4gWb4+\nKKpxfBNTKJ0n7JKdDf+FNyY/58djbsOFePvjYr6q4kHJRVA3BAaXyiLNkD5eh71n\nl3JTb8TFAgMBAAECggEAJVEhXXw+vRdujNvo2ChXKUODDb75I+a1hY02rre5enCg\nvanKQRPhVUcGh9kCZwdQ9YF5eTVg1y7UNAekvbw8pzBBq/MjYLxnXL7aPY9/qUlU\n3SOwpNjzJf/QHa0WqpbiJqy0x898r0l6+AFomh3wsl8Va0CNXZkwALXPB6cMNjhv\nJW4/bCDmAk3itc4WaSWFz1VdPaBswLEhzDt72UhIpIk1T3/v5h0Efx0qWOEcG4TO\nF9MacgSta0FjeuJVq5QCFJ3EV+SjTSwVkgtArKx7e0kpRg1lIs85QMFGD7rlStZg\ny1Yv2Ef9lxb3v6H7SGp6iRIxIjNQEIzVODVykCH4YQKBgQDqMAIaoW2OCs8K7ZPP\nU+ykV98KyrZtNo+mOZw7hMBhJ1g5tOBPINscN+lXbzMCvzwpr6RgavyIRqE3Vfj4\nI7crIGeRqfBDfB1mTDRyrSDgKqZ5OQwic9bw47KVnaQCrX0PHbpVx0c0k+plGGQK\nRxeb2Lb83xOg1HaLkimCZIE7FQKBgQDkLSQOsSy9nbCH/YouVQ5BVUAtTL3RkiyE\nXmQxrSTNqAq688Fx2bFky2/K5DCFw8VFY5yLg9hCAczrBsPy8+KOJZ/REFngyfCI\nAuQnVni3FG+7GCsrmoegPJVWp/JQGD3Qjb3QitKekmfmKRdPFV4td+JSKEp3BYe4\n80WyBVwO8QKBgDpwVHYUxmPlqpjNhE7+YFT6YHwu7ar/LIWMZsIrdF5KFSgBTOAy\nELtP8HiTFSWgVwEIBXrR98aB6YUHfSNetjyaz3137K7KcAOxDH15WnTV78jcRXzr\nbz2ZdF0Fg4HvjP+SqYbyPYCPULR9i6lM6EVJpRAhEqLVoedeR+Fz9xOpAoGAIWgG\nfmwsK7q5jL9vCqeDRcdwdPFmXRd0kxCqxKcf20g+Ae8MJFoF4cbzIBZWkE8AQ894\nrOhpsghHcyVzbM+OHNefVWF6dzG5mIAr3SKI2+0PCqpYL7MZJjmYd65xCI70BeOq\npaydd3/h3E2pzvdG6YtCxFqHxHM30rkzPAQS3VECgYA6oCTBoAFfzL/gXZJaluvd\nBthCXD5UVvK0VpYghGZmwq6msSMF7vs32RQMl7BaBm70JHvhI1rbfs5QF38dF/z/\nmlPxJS+xD0w0eMrqj5g9UcXFEFAeSRzjr9DYgoCVyivZnNu+b5t1QkzO0jdQ3Bjr\nPmTPp1Ffy9ZA7zC+p4qMOA==\n-----END PRIVATE KEY-----\n'
};

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: CREDENTIALS.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const sigInput = `${headerB64}.${payloadB64}`;

  const crypto = require('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(CREDENTIALS.private_key, 'base64url');
  const jwt = `${sigInput}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  return data.access_token;
}

async function appendRow(sheet, values) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheet)}!A1:Z1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] })
  });
  return res.json();
}

async function getRows(sheet) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheet)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.values || [];
}

async function updateRow(sheet, rowIndex, values) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheet)}!A${rowIndex}:Z${rowIndex}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] })
  });
  return res.json();
}

module.exports = { appendRow, getRows, updateRow, SHEET_ID };
