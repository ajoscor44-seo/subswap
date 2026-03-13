
/**
 * Calculates the prorated price for a seat when joining mid-cycle.
 */
export function calculateProratedSeatPrice(
  monthlyPrice: number,
  maxSeats: number,
  cycleStart: Date,
  cycleEnd: Date,
  joinDate: Date = new Date()
) {
  const fullSeatPrice = monthlyPrice / maxSeats;
  
  const totalCycleMs = cycleEnd.getTime() - cycleStart.getTime();
  const remainingMs = cycleEnd.getTime() - joinDate.getTime();
  
  if (remainingMs <= 0) {
    return {
      proratedPrice: 0,
      remainingDays: 0,
      fullRenewalPrice: fullSeatPrice,
    };
  }

  // Calculate ratio of remaining time
  const ratio = remainingMs / totalCycleMs;
  const proratedPrice = fullSeatPrice * ratio;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return {
    proratedPrice: Math.round(proratedPrice * 100) / 100, // Round to 2 decimals
    remainingDays,
    fullRenewalPrice: Math.round(fullSeatPrice * 100) / 100,
  };
}
