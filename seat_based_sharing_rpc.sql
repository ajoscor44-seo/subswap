
-- RPC to find an available group for a subscription
CREATE OR REPLACE FUNCTION public.find_available_group(p_subscription_id UUID)
RETURNS TABLE (
    id UUID,
    subscription_id UUID,
    host_user_id UUID,
    cycle_start TIMESTAMP WITH TIME ZONE,
    cycle_end TIMESTAMP WITH TIME ZONE,
    renewal_day INT,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, 
        g.subscription_id, 
        g.host_user_id, 
        g.cycle_start, 
        g.cycle_end, 
        g.renewal_day,
        COUNT(gm.id) as member_count
    FROM public.groups g
    JOIN public.subscriptions s ON s.id = g.subscription_id
    LEFT JOIN public.group_members gm ON gm.group_id = g.id AND gm.status = 'active'
    WHERE g.subscription_id = p_subscription_id
    GROUP BY g.id, s.max_seats
    HAVING COUNT(gm.id) < s.max_seats
    ORDER BY COUNT(gm.id) DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
