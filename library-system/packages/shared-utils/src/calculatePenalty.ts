/**
 * Calculate the penalty (fine) for an overdue loan.
 *
 * @param dueDate - The date the book was due.
 * @param returnDate - The date the book was actually returned (defaults to now).
 * @param dailyRate - The penalty rate per overdue day in the local currency unit (default: 5).
 * @returns The total penalty amount. Returns 0 if the book is not overdue.
 */
export function calculatePenalty(
  dueDate: Date,
  returnDate: Date = new Date(),
  dailyRate: number = 5,
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const overdueDays = Math.floor(
    (returnDate.getTime() - dueDate.getTime()) / msPerDay,
  );

  if (overdueDays <= 0) return 0;

  return overdueDays * dailyRate;
}
