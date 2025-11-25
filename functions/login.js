// login.js (or functions/login.js)

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await request.json();
  const username = body.username;
  const password = body.password;

  const USER = env.LOGIN_USER;
  const PASS = env.LOGIN_PASS;

  if (username === USER && password === PASS) {
    // Create a token value (in a real app you'd issue a signed JWT or session id)
    const tokenValue = 'valid_token_value';

    // Respect secure cookie requirements: only set Secure when on HTTPS.
    // During local HTTP development, Secure cookies won't be set by the browser.
    const isHttps = request.url.startsWith('https:');
    const secureFlag = isHttps ? ' Secure;' : '';

    // Build cookie string. HttpOnly prevents JS reading the cookie (good);
    // Path=/ makes it available site-wide; Max-Age controls expiry.
    const cookieValue = `session_token=${tokenValue}; HttpOnly;${secureFlag} Path=/; Max-Age=3600; SameSite=Strict`;

    // Return the Set-Cookie header and also include the token in JSON as a
    // convenience for local/static fallbacks (NOT a substitute for secure cookies).
    return new Response(JSON.stringify({ success: true, message: 'Login successful', token: tokenValue }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieValue
      }
    });
  } else {
    // Return unauthorized status code on failure
    return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
      status: 401, // Use 401 Unauthorized for failed login attempts
      headers: { "Content-Type": "application/json" }
    });
  }
}
