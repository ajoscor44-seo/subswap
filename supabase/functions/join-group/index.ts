import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) throw new Error('Unauthorized')

    const { subscriptionId } = await req.json()

    // 1. Fetch subscription details
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) throw new Error('Subscription not found')

    // 2. Find group with available seats using a transaction-like approach
    // We'll use an RPC or a complex query. For simplicity here, we'll find one and then try to join.
    // In a real production app, use a database function (RPC) to handle the locking and atomicity.
    
    // Attempt to find a group with space
    const { data: groups, error: groupsError } = await supabaseClient
      .rpc('find_available_group', { p_subscription_id: subscriptionId })

    let groupId: string;
    let cycleStart: Date;
    let cycleEnd: Date;

    if (groupsError || !groups || groups.length === 0) {
      // 3. Create a new group if none available
      const now = new Date();
      cycleStart = now;
      cycleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const { data: newGroup, error: createGroupError } = await supabaseClient
        .from('groups')
        .insert({
          subscription_id: subscriptionId,
          host_user_id: user.id,
          cycle_start: cycleStart.toISOString(),
          cycle_end: cycleEnd.toISOString(),
          renewal_day: now.getDate(),
        })
        .select()
        .single()

      if (createGroupError) throw createGroupError;
      groupId = newGroup.id;

      // Add host as the first member
      await supabaseClient.from('group_members').insert({
        group_id: groupId,
        user_id: user.id,
        seat_number: 1,
        role: 'host',
        status: 'active',
      })
      
      // Host pays full amount for the first cycle? 
      // Usually host owns the account, but in this marketplace model everyone pays their share.
    } else {
      groupId = groups[0].id;
      cycleStart = new Date(groups[0].cycle_start);
      cycleEnd = new Date(groups[0].cycle_end);
    }

    // 4. Calculate prorated price
    const { calculateProratedSeatPrice } = await import("../../lib/billing.ts");
    const { proratedPrice, remainingDays, fullRenewalPrice } = calculateProratedSeatPrice(
      subscription.monthly_price,
      subscription.max_seats,
      cycleStart,
      cycleEnd
    );

    // 5. Create pending member record
    // Find next available seat number
    const { data: members } = await supabaseClient
      .from('group_members')
      .select('seat_number')
      .eq('group_id', groupId);
    
    const takenSeats = members?.map(m => m.seat_number) || [];
    let nextSeat = 1;
    while (takenSeats.includes(nextSeat)) nextSeat++;

    if (nextSeat > subscription.max_seats) throw new Error('Group is full');

    const { error: memberError } = await supabaseClient
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        seat_number: nextSeat,
        role: 'member',
        status: 'pending',
      })

    if (memberError) throw memberError;

    // 6. Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        group_id: groupId,
        amount: proratedPrice,
        billing_cycle_start: new Date().toISOString(),
        billing_cycle_end: cycleEnd.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) throw paymentError;

    return new Response(
      JSON.stringify({
        paymentId: payment.id,
        proratedPrice,
        remainingDays,
        fullRenewalPrice,
        cycleEnd: cycleEnd.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
