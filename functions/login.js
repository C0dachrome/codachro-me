export async function onRequestPost(context) {
    try {
        const { request, env } = context;

        const { username, password } = await request.json();

        // These MUST be added in Cloudflare Pages project -> Settings -> Environment Variables
        const REAL_USER = env.LOGIN_USER;
        const REAL_PASS = env.LOGIN_PASS;

        if (username === REAL_USER && password === REAL_PASS) {
            // Create a super simple token
            const token = btoa(`${username}:${Date.now()}`);

            return new Response(JSON.stringify({
                success: true,
                token
            }), {
                headers: { "Content-Type": "application/json" }
            });

        } else {
            return new Response(JSON.stringify({
                success: false,
                error: "invalid credentials"
            }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: "server error",
            message: err.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
