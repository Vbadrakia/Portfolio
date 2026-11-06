const NOTIFY_TO = "vedantbadrakia07@gmail.com";
const NOTIFY_FROM = "Portfolio <onboarding@resend.dev>";

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
        },
    });
}

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    if (url.pathname !== "/api/contact") {
        return next();
    }

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "access-control-allow-headers": "content-type",
                "access-control-allow-methods": "POST, OPTIONS",
                "access-control-allow-origin": "*",
            },
        });
    }

    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    if (!env.RESEND_API_KEY) {
        return json({ error: "Email service is not configured" }, 503);
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return json({ error: "Request body must be valid JSON" }, 400);
    }

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Name, valid email, and message are required" }, 400);
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            authorization: `Bearer ${env.RESEND_API_KEY}`,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            from: env.NOTIFY_FROM || NOTIFY_FROM,
            to: [env.NOTIFY_TO || NOTIFY_TO],
            reply_to: email,
            subject: `Portfolio contact from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        }),
    });

    if (!resendResponse.ok) {
        return json({ error: "Unable to send message" }, 502);
    }

    return json({ ok: true });
}
