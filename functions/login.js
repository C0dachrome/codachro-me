export async function onRequestPost(context) {
    const { LOGIN_USER, LOGIN_PASS } = context.env;
    const body = await context.request.json();

    if (body.username === USERNAME && body.password === PASSWORD) {
        const token = crypto.randomUUID(); // simple random token
        return new Response(JSON.stringify({ success: true, token }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" }
    });
}
