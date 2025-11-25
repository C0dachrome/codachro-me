export async function onRequestPost(context) {
    const form = await context.request.formData();
    const user = form.get("user");
    const pass = form.get("pass");

    // Change these to your actual credentials
    const VALID_USER = context.env.LOGIN_USER;
    const VALID_PASS = context.env.LOGIN_PASS;

    if (user === VALID_USER && pass === VALID_PASS) {
        const cookie = await createAuthCookie(context.env.SECRET_KEY);

        return new Response("Logged in", {
            status: 302,
            headers: {
                "Set-Cookie": cookie,
                "Location": "/dashboard/private.html"
            }
        });
    }

    return new Response("Invalid login", { status: 401 });
}

async function createAuthCookie(secret) {
    const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const token = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(secret + expiration)
    );

    const hexToken = [...new Uint8Array(token)]
          .map(b => b.toString(16).padStart(2, "0")).join("");

    return `session=${hexToken}.${expiration}; Path=/; HttpOnly; SameSite=Lax;`;
}
