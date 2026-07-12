import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  try {
    const { emails, eventoNombre, joinUrl } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0 || !eventoNombre || !joinUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(
      emails.map(async (email: string) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SecretGift <onboarding@resend.dev>",
            to: email,
            subject: `🎁 Te invitaron a ${eventoNombre}`,
            html: `
              <h1>🎁 ${eventoNombre}</h1>
              <p>Te invitaron a participar en un intercambio de regalos.</p>
              <a href="${joinUrl}">Unirme como comprador</a>
            `,
          }),
        });
        return { email, ok: res.ok };
      }),
    );

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
