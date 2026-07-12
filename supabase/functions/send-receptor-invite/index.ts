import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  try {
    const { email, eventoNombre, claimUrl } = await req.json();

    if (!email || !eventoNombre || !claimUrl) {
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

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SecretGift <onboarding@resend.dev>",
        to: email,
        subject: `🎁 Te invitaron como el receptor de ${eventoNombre}`,
        html: `
          <h1>🎁 ${eventoNombre}</h1>
          <p>Te invitaron como la persona que recibirá los regalos en este intercambio.</p>
          <p>Confirma tu lugar y registra tu lista de deseos:</p>
          <a href="${claimUrl}">Confirmar y registrar deseos</a>
        `,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      return new Response(JSON.stringify({ error: "Resend error", detail }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
