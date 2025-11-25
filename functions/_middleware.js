// functions/_middleware.js

// Define the name of the cookie we set in login.js
const AUTH_COOKIE_NAME = 'session_token';
// Use an absolute path so redirects resolve correctly regardless of current URL
const LOGIN_PAGE_PATH = '/dashboard/login.html';

export async function onRequest(context) {
  const { request, next, functionPath } = context;
  const url = new URL(request.url);
  // Apply protection only to paths under /dashboard/
  if (url.pathname.startsWith('/dashboard/')) {
    // Allow public pages under /dashboard/ (login, public landing)
    const publicPaths = new Set(['/dashboard/login.html', '/dashboard/public.html']);
    if (publicPaths.has(url.pathname)) {
      return next();
    }

    const cookieHeader = request.headers.get('Cookie');
    let isAuthenticated = false;

    if (cookieHeader && cookieHeader.includes(`${AUTH_COOKIE_NAME}=`)) {
      // In a real application, you might want to decode the token here
      // and verify its signature and expiration.
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      // If not logged in, redirect them to the login page
      return Response.redirect(new URL(LOGIN_PAGE_PATH, url.origin).toString(), 302);
    }
  }

  // If authenticated (or not a protected page), proceed to the next handler/serve the page
  return next();
}
