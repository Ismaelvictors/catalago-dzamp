const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  try {
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    const provided = req.headers.get('x-admin-password') ?? '';
    if (!adminPassword || provided !== adminPassword) {
      return json({ error: 'unauthorized' }, 401);
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: 'server_not_configured' }, 500);

    const body = await req.json();
    const action = body?.action;
    const authHeaders = {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
      'Content-Type': 'application/json',
    };

    if (action === 'login') return json({ ok: true });

    if (action === 'upload_image') {
      const dataUrl: string = body?.data ?? '';
      const m = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/.exec(dataUrl);
      if (!m) return json({ error: 'invalid_image' }, 400);
      const mime = m[1];
      const ext = mime.split('/')[1].replace('jpeg', 'jpg');
      const bytes = Uint8Array.from(atob(m[3]), (c) => c.charCodeAt(0));

      // Ensure the public bucket exists (ignore "already exists" errors).
      await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ id: 'product-images', name: 'product-images', public: true }),
      });

      const path = `products/${crypto.randomUUID()}.${ext}`;
      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE, 'Content-Type': mime },
        body: bytes,
      });
      if (!up.ok) return json({ error: 'upload_failed', detail: await up.text() }, 500);
      return json({ url: `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}` });
    }

    switch (action) {
      case 'list_products': {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
          headers: authHeaders,
        });
        if (!r.ok) return json({ error: 'db_error', detail: await r.text() }, 500);
        return json(await r.json());
      }
      case 'create_product': {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
          method: 'POST',
          headers: { ...authHeaders, Prefer: 'return=representation' },
          body: JSON.stringify(body.product),
        });
        if (!r.ok) return json({ error: 'db_error', detail: await r.text() }, 500);
        return json(await r.json());
      }
      case 'update_product': {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${body.id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify(body.product),
        });
        if (!r.ok) return json({ error: 'db_error', detail: await r.text() }, 500);
        return json({ ok: true });
      }
      case 'delete_product': {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${body.id}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
        if (!r.ok) return json({ error: 'db_error', detail: await r.text() }, 500);
        return json({ ok: true });
      }
      case 'set_whatsapp': {
        const value = String(body.value ?? '').replace(/\D/g, '');
        if (!value) return json({ error: 'invalid_number' }, 400);
        const r = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
          method: 'POST',
          headers: { ...authHeaders, Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({ key: 'whatsapp_number', value }),
        });
        if (!r.ok) return json({ error: 'db_error', detail: await r.text() }, 500);
        return json({ ok: true });
      }
      default:
        return json({ error: 'unknown_action' }, 400);
    }
  } catch (e) {
    return json({ error: 'internal', detail: String(e) }, 500);
  }
});
