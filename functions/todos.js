// functions/todos.js
// Handle todo operations (get, save)

const AUTH_COOKIE_NAME = 'session_token';

// Check if user is authenticated
function isAuthenticated(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  return cookieHeader.includes(`${AUTH_COOKIE_NAME}=`);
}

export async function onRequest(context) {
  const { request, env } = context;

  // Verify authentication
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Get todos (GET request)
  if (request.method === 'GET') {
    try {
      // Get todos from KV storage
      const todos = await env.CODACHROME_KV.get('todos', 'json') || [];
      return new Response(JSON.stringify(todos), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch todos' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  // Save todos (POST request)
  if (request.method === 'POST') {
    try {
      const todos = await request.json();
      
      // Validate todos array
      if (!Array.isArray(todos)) {
        return new Response(JSON.stringify({ error: 'Invalid todos format' }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Save to KV storage
      await env.CODACHROME_KV.put('todos', JSON.stringify(todos));
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (error) {
      console.error('Error saving todos:', error);
      return new Response(JSON.stringify({ error: 'Failed to save todos' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
