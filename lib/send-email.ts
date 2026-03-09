import { supabase } from "@/lib/supabase";

export async function triggerEmail(type: string, payload: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const { data, error } = await supabase.functions.invoke("send-email", {
    body: { type, payload },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (error) throw new Error(error.message);
  return data;
}