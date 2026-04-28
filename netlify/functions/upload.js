const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!appsScriptUrl || !secret) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'APPS_SCRIPT_URL e APPS_SCRIPT_SECRET não configurados no Netlify' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { file, mimeType, filename, unitLabel, folder } = body;

    if (!file || !filename || !unitLabel || !folder) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: 'Campos obrigatórios ausentes' }),
      };
    }

    const resp = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({ file, mimeType, filename, unitLabel, folder, secret }),
    });

    const result = await resp.json();

    return {
      statusCode: result.success ? 200 : 500,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('[upload]', err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
