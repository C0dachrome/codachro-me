export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await request.json();
  const username = body.username;
  const password = body.password;

  // Env variables stored in Cloudflare Pages
  const USER = env.LOGIN_USER;
  const PASS = env.LOGIN_PASS;

  if (username === USER && password === PASS) {
    // generate a simple token or just return success
    return new Response(JSON.stringify({ success: true, token: "123abc" }), {
      headers: { "Content-Type": "application/json" }
    });
  } else {
    return new Response(JSON.stringify({ success: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
