/**
 * Calculates the prorated price for a seat when joining mid-cycle.
 * @param seatPrice The full monthly price for one seat.
 * @param cycleStart The date the 30-day cycle began.
 * @param cycleEnd The date the 30-day cycle ends.
 * @param joinDate The current date (defaults to now).
 */
export function calculateProratedSeatPrice(
  seatPrice: number,
  cycleStart: Date,
  cycleEnd: Date,
  joinDate: Date = new Date()
) {
  const totalCycleMs = cycleEnd.getTime() - cycleStart.getTime();
  const remainingMs = cycleEnd.getTime() - joinDate.getTime();
  
  if (remainingMs <= 0) {
    return {
      proratedPrice: 0,
      remainingDays: 0,
      fullPrice: seatPrice,
    };
  }

  // Calculate ratio of remaining time
  const ratio = Math.max(0, Math.min(1, remainingMs / totalCycleMs));
  const proratedPrice = seatPrice * ratio;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return {
    proratedPrice: Math.round(proratedPrice * 100) / 100, // Round to 2 decimals
    remainingDays,
    fullPrice: seatPrice,
  };
}
