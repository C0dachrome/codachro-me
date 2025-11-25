export async function onRequestGet(context) {
  const token = context.request.headers.get("Authorization");

  if (!token) return new Response("Unauthorized", { status: 401 });

  const valid = await context.env.SESSIONS.get(token);

  if (valid) return new Response("OK");

  return new Response("Unauthorized", { status: 401 });
}
