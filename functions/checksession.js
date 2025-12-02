// functions/checksession.js

const AUTH_COOKIE_NAME = 'session_token';

export async function onRequest(context) {
  const { request } = context;

  // Only accept GET requests for this health/check endpoint
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }

  const cookieHeader = request.headers.get('Cookie') || '';

  if (cookieHeader.includes(`${AUTH_COOKIE_NAME}=`)) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
}
