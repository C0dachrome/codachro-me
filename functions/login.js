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
    // 1. Define the secure cookie string
    // HttpOnly: Prevents client-side JS from reading the cookie
    // Secure: Ensures the cookie is only sent over HTTPS
    // Path=/: Makes the cookie available across your entire site
    // Max-Age: Sets the cookie to expire in 1 hour (3600 seconds)
    const cookieValue = `session_token=valid_token_value; HttpOnly; Secure; Path=/; Max-Age=3600; SameSite=Strict`;

    // 2. Return a success response with the Set-Cookie header
    return new Response(JSON.stringify({ success: true, message: "Login successful" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieValue // <--- This is the key change
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
