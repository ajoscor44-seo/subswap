import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  welcomeEmail, purchaseEmail, walletFundedEmail,
  accountBannedEmail, accountRestoredEmail, adminMessageEmail,
} from "../_shared/templates.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM_NOREPLY = "DiscountZAR <noreply@discountzar.com>";
const FROM_SUPPORT = "DiscountZAR Support <support@discountzar.com>";

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
  // CORS for browser calls
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { type, payload } = await req.json();

    // For admin_message: verify the caller is actually an admin
    if (type === "admin_message") {
      const authHeader = req.headers.get("Authorization") ?? "";
      const token = authHeader.replace("Bearer ", "");
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const { data: profile } = await supabase
        .from("profiles").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }
    }

    switch (type) {
      case "welcome":
        await resend(payload.email, "Welcome to DiscountZAR 🎉", welcomeEmail(payload.username));
        break;

      case "purchase":
        await resend(
          payload.email,
          `Your ${payload.serviceName} slot is ready!`,
          purchaseEmail(payload)
        );
        break;

      case "wallet_funded":
        await resend(
          payload.email,
          `₦${Number(payload.amount).toLocaleString()} credited to your wallet`,
          walletFundedEmail(payload)
        );
        break;

      case "account_banned":
        await resend(
          payload.email,
          "Your DiscountZAR account has been restricted",
          accountBannedEmail(payload.username),
          FROM_SUPPORT   // ← support@ for moderation
        );
        break;

      case "account_restored":
        await resend(
          payload.email,
          "Your DiscountZAR account has been restored",
          accountRestoredEmail(payload.username),
          FROM_SUPPORT
        );
        break;

      case "admin_message":
        await resend(
          payload.email,
          payload.subject,
          adminMessageEmail(payload),
          FROM_SUPPORT   // ← support@ for all admin messages
        );
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (err) {
    console.error("[send-email]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});