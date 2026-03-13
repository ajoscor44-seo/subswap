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

    const { inviteToken } = await req.json()

    // 1. Fetch and validate invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('invitations')
      .select('*, groups(*, subscriptions(*))')
      .eq('invite_token', inviteToken)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) throw new Error('Invitation not found or already used')
    
    if (new Date(invitation.expires_at) < new Date()) {
      await supabaseClient.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
      throw new Error('Invitation has expired')
    }

    const group = invitation.groups
    const subscription = group.subscriptions

    // 2. Determine next seat
    const { data: members } = await supabaseClient
      .from('group_members')
      .select('seat_number')
      .eq('group_id', group.id);
    
    const takenSeats = members?.map(m => m.seat_number) || [];
    let nextSeat = 1;
    while (takenSeats.includes(nextSeat)) nextSeat++;

    if (nextSeat > subscription.max_seats) throw new Error('Group is full')

    // 3. Join group
    const { error: joinError } = await supabaseClient
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        seat_number: nextSeat,
        role: 'member',
        status: 'pending',
      })

    if (joinError) throw joinError

    // 4. Calculate prorated billing
    const { calculateProratedSeatPrice } = await import("../../lib/billing.ts");
    const { proratedPrice, cycleEnd } = calculateProratedSeatPrice(
      subscription.monthly_price,
      subscription.max_seats,
      new Date(group.cycle_start),
      new Date(group.cycle_end)
    );

    // 5. Create payment
    const { data: payment, error: payError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        group_id: group.id,
        amount: proratedPrice,
        billing_cycle_start: new Date().toISOString(),
        billing_cycle_end: group.cycle_end,
        status: 'pending',
      })
      .select()
      .single()

    if (payError) throw payError

    // 6. Mark invitation as accepted
    await supabaseClient
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentId: payment.id,
        amount: proratedPrice,
        subscriptionName: subscription.name
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
