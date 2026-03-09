// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verificationEmail, passwordResetEmail } from "../_shared/templates.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_NOREPLY = "DiscountZAR <noreply@discountzar.com>";

async function resend(to: string, subject: string, html: string, from = FROM_NOREPLY) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Resend failed");
  }
  return res.json();
}

serve(async (req) => {
  try {
    const body = await req.json();

    // Supabase auth hook payload shape
    const email: string = body.user?.email ?? body.email ?? "";
    const emailData = body.email_data ?? {};
    const tokenType: string = emailData.token_type ?? body.type ?? "";
    const confirmationUrl: string =
      emailData.confirmation_url ?? emailData.recovery_url ?? emailData.invite_url ?? "";

    let subject = "";
    let html = "";

    if (tokenType === "signup" || tokenType === "email_change") {
      subject = "Verify your DiscountZAR email";
      html = verificationEmail(confirmationUrl);
    } else if (tokenType === "recovery") {
      subject = "Reset your DiscountZAR password";
      html = passwordResetEmail(confirmationUrl);
    } else {
      // Unknown type — let Supabase handle it
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    await resend(email, subject, html);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[send-auth-email]", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
