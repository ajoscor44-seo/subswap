# Email verification setup (Supabase)

This app requires users to verify their email before they can sign in. The verification email is sent by Supabase (or your auth hook), and the **welcome email** is sent only after they verify.

Follow these steps in the Supabase Dashboard to make it work.

---

## 1. Enable email confirmation

1. In [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **Authentication** → **Providers** → **Email**.
3. Turn **ON** “Confirm email”.
4. (Optional) Set **“Secure email change”** to ON if you want users to confirm when changing email.

Result: New signups will not get a session until they click the verification link. The verification email is sent by Supabase (or by your custom hook; see step 3).

---

## 2. Set redirect URLs

After the user clicks the link in the verification email, Supabase redirects them to your app. You must allow that URL:

1. Go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your app’s public URL, e.g.  
   `https://discountzar.com` or `http://localhost:5173` for local dev.
3. Under **Redirect URLs**, add:
   - Production: `https://discountzar.com/**`
   - Local: `http://localhost:5173/**`  
     (The `/**` allows any path after the origin.)

Save. Supabase will redirect to your Site URL (or the path you use in the confirmation link) after verification.

---

## 3. Use your own verification email (optional)

The app can send the verification email via Resend (same templates as the rest of the app) using the `send-email` Edge Function:

1. In **Authentication** → **Hooks**, add an **Auth Hook**.
2. Choose **Send Email** (or “Customize email” / “Send email with custom template”, depending on your Supabase version).
3. Point it to your Edge Function that sends the verification email (e.g. `send-email`).
4. **Important:** Supabase signs the webhook payload. Your function must verify it using `SEND_EMAIL_HOOK_SECRET` (see step 5).

If you use the built-in Supabase emails instead, skip this step; Supabase will send its default verification email.

---

## 4. Run schema migrations

Ensure the database has the new column and RLS so “verified” and “welcome sent” are stored correctly:

1. In the SQL Editor, run the migrations in `schema.sql` (or apply them via your migration tool).
2. In particular, ensure `profiles` has:
   - `welcome_email_sent` (boolean, default `false`)
   - `is_verified` (boolean, default `false`)

The app sets `is_verified = true` when it sees `email_confirmed_at` on the auth user, and sets `welcome_email_sent = true` after sending the welcome email once.

---

## 5. Edge Function env (for custom emails)

If you use the `send-email` function:

1. Go to **Project Settings** → **Edge Functions** (or **Secrets**).
2. Set:
   - `RESEND_API_KEY` – your Resend API key.
   - `SUPABASE_URL` – your project URL (usually already present in Supabase Edge Functions).
   - `SEND_EMAIL_HOOK_SECRET` – generated in **Authentication → Hooks** (looks like `v1,whsec_...`).

If you use the shared email templates with the app logo:

- Set `APP_URL` (e.g. `https://discountzar.com`) so the logo URL in emails is correct.  
  Default in code is `https://discountzar.com` if `APP_URL` is not set.

---

## 6. Deploy the logo for emails

Email templates use the app logo at:

`{APP_URL}/icons/icon-192x192.png`

Ensure that URL is publicly reachable:

- In production, deploy your app so `https://your-domain.com/icons/icon-192x192.png` serves the file from `public/icons
/icon-192x192.png`.
- If you use a different domain for the app, set `APP_URL` in Edge Function secrets to that domain.

---

## Flow summary

1. User signs up → no session yet; UI shows “Check your inbox”.
2. User receives verification email (from Supabase or `send-email`) with a link.
3. User clicks link → Supabase confirms email and redirects to your app.
4. App gets a session with `email_confirmed_at` set → user is treated as verified.
5. App sets `profiles.is_verified = true` and, once, sends the **welcome email** and sets `profiles.welcome_email_sent = true`.
6. User can use the app (dashboard, etc.) from then on.

If a user tries to sign in before verifying, they see:  
“Please verify your email before signing in. Check your inbox for the verification link.”
