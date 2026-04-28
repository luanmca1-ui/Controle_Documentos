function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestPost({ request, env }) {
  const { APPS_SCRIPT_URL, APPS_SCRIPT_SECRET } = env;

  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_SECRET) {
    return json({ success: false, error: 'APPS_SCRIPT_URL e APPS_SCRIPT_SECRET não configurados no Cloudflare' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'JSON inválido' }, 400);
  }

  const { file, mimeType, filename, unitLabel, folder } = body;

  if (!file || !filename || !unitLabel || !folder) {
    return json({ success: false, error: 'Campos obrigatórios ausentes' }, 400);
  }

  try {
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({ file, mimeType, filename, unitLabel, folder, secret: APPS_SCRIPT_SECRET }),
    });

    const result = await resp.json();
    return json(result, result.success ? 200 : 500);
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}
