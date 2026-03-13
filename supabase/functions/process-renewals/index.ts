import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    // 1. Find groups where cycle_end <= now
    const now = new Date();
    const { data: expiredGroups, error: expiredError } = await supabaseClient
      .from('groups')
      .select('*, subscriptions(*)')
      .lte('cycle_end', now.toISOString());

    if (expiredError) throw expiredError;

    const results = [];

    for (const group of expiredGroups || []) {
      const subscription = group.subscriptions;
      const seatPrice = subscription.monthly_price / subscription.max_seats;

      // 2. Fetch active members
      const { data: members, error: membersError } = await supabaseClient
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .eq('status', 'active');

      if (membersError) continue;

      const newCycleStart = now;
      const newCycleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      for (const member of members || []) {
        // 3. Create new payment record
        // In a real system, we'd attempt to charge their card/wallet here.
        // If successful, create record as 'paid'. If not, 'failed'.
        
        const { error: payError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: member.user_id,
            group_id: group.id,
            amount: seatPrice,
            billing_cycle_start: newCycleStart.toISOString(),
            billing_cycle_end: newCycleEnd.toISOString(),
            status: 'pending', // Assume automated system will pick this up
          });
          
        if (payError) {
          // If creation fails, we might want to flag the user for removal
          console.error(`Renewal failed for user ${member.user_id} in group ${group.id}`);
        }
      }

      // 4. Update group cycle
      await supabaseClient
        .from('groups')
        .update({
          cycle_start: newCycleStart.toISOString(),
          cycle_end: newCycleEnd.toISOString(),
        })
        .eq('id', group.id);
        
      results.push({ groupId: group.id, membersProcessed: members?.length || 0 });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
