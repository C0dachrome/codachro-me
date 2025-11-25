export async function onRequest(context) {
    const cookie = context.request.headers.get("Cookie") || "";
    const session = cookie.split("session=")[1];

    if (!session) {
        return Response.redirect("/login", 302);
    }

    const [token, exp] = session.split(".");
    if (Date.now() > parseInt(exp) * 1000) {
        return Response.redirect("/login", 302);
    }

    // Allow access
    return await context.next();
}
