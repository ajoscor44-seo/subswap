import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  welcomeEmail, purchaseEmail, walletFundedEmail,
  accountBannedEmail, accountRestoredEmail, adminMessageEmail,
} from "../_shared/templates.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM_JOSCOR = "DiscountZAR <joscor@discountzar.com>";
const FROM_SUPPORT = "DiscountZAR Support <support@discountzar.com>";

const ADMIN_ONLY_TYPES = ["wallet_funded", "account_banned", "account_restored", "admin_message"];

async function getAuthUser(req: Request): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id, email: user.email };
}

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", userId)
    .single();
  return profile?.role === "admin" || profile?.is_admin === true;
}

/** Returns true if the request is authenticated with the service role key.
 *  DB triggers (pg_net) use the service role key as their Bearer token.
 *  We trust these calls unconditionally — they originate server-side. */
function isServiceRole(req: Request): boolean {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  return token === SUPABASE_SERVICE_KEY;
}

async function resend(to: string, subject: string, html: string, from = FROM_JOSCOR) {
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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type) {
      return new Response(JSON.stringify({ error: "Missing type or payload" }), { status: 400 });
    }

    // ── Normalise payload ────────────────────────────────────────────────────
    // Client calls send: { type, payload: { email, ... } }
    // DB trigger sends:  { type, email, username, ... }  (flat, no payload key)
    // We support both so the trigger never needs to know about the wrapper.
    const payload: Record<string, any> =
      body.payload && typeof body.payload === "object"
        ? body.payload          // standard client call
        : { ...body, type: undefined }; // flatten trigger call, strip `type`

    if (!payload || typeof payload !== "object" || Object.keys(payload).length === 0) {
      return new Response(JSON.stringify({ error: "Missing type or payload" }), { status: 400 });
    }

    // ── Auth ─────────────────────────────────────────────────────────────────
    // Service role key = DB trigger or trusted server call → skip all checks.
    // Otherwise validate the user JWT and apply per-type access rules.
    const fromServiceRole = isServiceRole(req);

    if (!fromServiceRole) {
      const authUser = await getAuthUser(req);
      if (!authUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      if (ADMIN_ONLY_TYPES.includes(type)) {
        const isSelfFunding =
          type === "wallet_funded" &&
          payload.email?.toLowerCase() === authUser.email?.toLowerCase();

        if (!isSelfFunding) {
          const ok = await isAdmin(authUser.id);
          if (!ok) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
          }
        }
      } else if (type === "welcome" || type === "purchase") {
        if (payload.email?.toLowerCase() !== authUser.email?.toLowerCase()) {
          return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
        }
      }
    }

    // ── Send ─────────────────────────────────────────────────────────────────
    let result;
    switch (type) {
      case "welcome":
        result = await resend(
          payload.email,
          "Welcome to DiscountZAR 🎉",
          welcomeEmail(payload.username),
        );
        break;

      case "purchase":
        result = await resend(
          payload.email,
          `Your ${payload.serviceName} slot is ready!`,
          purchaseEmail(payload),
        );
        break;

      case "wallet_funded":
        result = await resend(
          payload.email,
          `₦${Number(payload.amount).toLocaleString()} credited to your wallet`,
          walletFundedEmail(payload),
        );
        break;

      case "account_banned":
        result = await resend(
          payload.email,
          "Your DiscountZAR account has been restricted",
          accountBannedEmail(payload.username),
          FROM_SUPPORT,
        );
        break;

      case "account_restored":
        result = await resend(
          payload.email,
          "Your DiscountZAR account has been restored",
          accountRestoredEmail(payload.username),
          FROM_SUPPORT,
        );
        break;

      case "admin_message":
        result = await resend(
          payload.email,
          payload.subject,
          adminMessageEmail(payload),
          FROM_SUPPORT,
        );
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, result }), {
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