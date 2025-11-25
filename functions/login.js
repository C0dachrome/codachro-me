export async function onRequestPost(context) {
  const { request, env } = context;

  const body = await request.json();
  const { username, password } = body;

  // Compare with environment variables
  if (
    username === env.ADMIN_USER &&
    password === env.ADMIN_PASS
  ) {
    // Create a simple session token
    const token = crypto.randomUUID();

    // Store it in KV
    await env.SESSIONS.put(token, "valid", { expirationTtl: 3600 });

    return new Response(JSON.stringify({ success: true, token }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: false }), {
    headers: { "Content-Type": "application/json" },
    status: 401,
  });
}
